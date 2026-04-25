import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';
const { Decimal } = require('@prisma/client/runtime/library');

@Injectable()
export class LandlordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.landlord.findMany({ include: { _count: { select: { properties: true, tenants: true, leases: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const l = await this.prisma.landlord.findUnique({ where: { id }, include: { properties: { include: { _count: { select: { units: true } } } }, _count: { select: { tenants: true, leases: true } } } });
    if (!l) throw new NotFoundException('Landlord not found');
    return l;
  }

  async create(dto: any) {
    if (await this.prisma.landlord.findUnique({ where: { email: dto.email } })) throw new ConflictException('Email in use');
    if (await this.prisma.landlord.findUnique({ where: { accountPrefix: dto.accountPrefix.toUpperCase() } })) throw new ConflictException('Prefix in use');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.prisma.$transaction(async (tx) => {
      const landlord = await tx.landlord.create({ data: { name: dto.name, businessName: dto.businessName, email: dto.email.toLowerCase(), phone: dto.phone, paybillNumber: dto.paybillNumber, accountPrefix: dto.accountPrefix.toUpperCase(), branding: dto.branding } });
      await tx.user.create({ data: { email: dto.email.toLowerCase(), phone: dto.phone, passwordHash, firstName: dto.name.split(' ')[0] || dto.name, lastName: dto.name.split(' ').slice(1).join(' ') || '', role: UserRole.LANDLORD, landlordId: landlord.id } });
      return landlord;
    });
  }

  async update(id: string, dto: any) {
    await this.findOne(id);
    return this.prisma.landlord.update({ where: { id }, data: dto });
  }

  async getDashboard(landlordId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalProperties, unitStats, expectedRent, collectedRent, overdueCharges, recentPayments, unpaidTenants] = await Promise.all([
      this.prisma.property.count({ where: { landlordId, isActive: true } }),
      this.prisma.unit.groupBy({ by: ['status'], where: { property: { landlordId } }, _count: true }),
      this.prisma.rentCharge.aggregate({ where: { landlordId, billingPeriod: startOfMonth }, _sum: { amountDue: true } }),
      this.prisma.rentCharge.aggregate({ where: { landlordId, billingPeriod: startOfMonth }, _sum: { amountPaid: true } }),
      this.prisma.rentCharge.findMany({ where: { landlordId, status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] }, dueDate: { lt: now } }, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } } }, orderBy: { dueDate: 'asc' }, take: 10 }),
      this.prisma.payment.findMany({ where: { landlordId, isReversed: false }, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } } }, orderBy: { paidAt: 'desc' }, take: 10 }),
      this.prisma.rentCharge.findMany({ where: { landlordId, billingPeriod: startOfMonth, status: { in: ['UNPAID', 'PARTIAL'] } }, include: { tenant: true, lease: { include: { unit: true } } }, take: 20 }),
    ]);
    const occupied = unitStats.find(s => s.status === 'OCCUPIED')?._count ?? 0;
    const vacant = unitStats.find(s => s.status === 'VACANT')?._count ?? 0;
    const totalUnits = unitStats.reduce((a, b) => a + b._count, 0);
    const expected = Number(expectedRent._sum.amountDue ?? 0);
    const collected = Number(collectedRent._sum.amountPaid ?? 0);
    return { properties: totalProperties, units: { total: totalUnits, occupied, vacant }, rent: { expected, collected, outstanding: expected - collected, collectionRate: expected ? Math.round((collected / expected) * 100) : 0 }, overdueCharges, recentPayments, unpaidTenants };
  }

  async getUsers(landlordId: string) {
    return this.prisma.user.findMany({ where: { landlordId }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, lastLoginAt: true, createdAt: true } });
  }
}
