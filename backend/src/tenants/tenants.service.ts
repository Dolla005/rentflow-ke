import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(landlordId: string) {
    return this.prisma.tenant.findMany({ where: { landlordId }, include: { leases: { where: { status: 'ACTIVE' }, include: { unit: { include: { property: true } } } }, _count: { select: { leases: true, payments: true } } }, orderBy: { createdAt: 'desc' } });
  }
  async findOne(id: string, landlordId: string) {
    const t = await this.prisma.tenant.findFirst({ where: { id, landlordId }, include: { leases: { include: { unit: { include: { property: true } } }, orderBy: { createdAt: 'desc' } }, payments: { include: { receipt: true }, orderBy: { paidAt: 'desc' }, take: 20 } } });
    if (!t) throw new NotFoundException('Tenant not found');
    return t;
  }
  async create(landlordId: string, dto: any) {
    if (dto.email && await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })) throw new ConflictException('Email already in use');
    return this.prisma.$transaction(async (tx) => {
      let userId: string | undefined;
      if (dto.email && dto.password) {
        const user = await tx.user.create({ data: { email: dto.email.toLowerCase(), phone: dto.phone, passwordHash: await bcrypt.hash(dto.password, 12), firstName: dto.firstName, lastName: dto.lastName, role: UserRole.TENANT, landlordId } });
        userId = user.id;
      }
      return tx.tenant.create({ data: { landlordId, userId, firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone, email: dto.email, nationalId: dto.nationalId, emergencyContactName: dto.emergencyContactName, emergencyContactPhone: dto.emergencyContactPhone, notes: dto.notes } });
    });
  }
  async update(id: string, landlordId: string, dto: any) {
    await this.findOne(id, landlordId);
    return this.prisma.tenant.update({ where: { id }, data: dto });
  }
  async getLedger(id: string, landlordId: string) {
    const tenant = await this.findOne(id, landlordId);
    const charges = await this.prisma.rentCharge.findMany({ where: { tenantId: id }, include: { allocations: { include: { payment: true } }, lateFees: true, lease: { include: { unit: { include: { property: true } } } } }, orderBy: { billingPeriod: 'desc' } });
    let runningBalance = 0;
    const ledger = [];
    for (const charge of [...charges].reverse()) {
      const lateTotal = charge.lateFees.filter(f => !f.isWaived).reduce((s, f) => s + Number(f.amount), 0);
      runningBalance += Number(charge.amountDue) + lateTotal;
      const period = new Date(charge.billingPeriod).toLocaleString('default', { month: 'long', year: 'numeric' });
      ledger.push({ type: 'CHARGE', date: charge.dueDate, description: 'Rent - ' + period, amount: Number(charge.amountDue), balance: runningBalance });
      if (lateTotal > 0) ledger.push({ type: 'LATE_FEE', date: charge.dueDate, description: 'Late payment fee', amount: lateTotal, balance: runningBalance });
      for (const alloc of charge.allocations) {
        runningBalance -= Number(alloc.amountApplied);
        ledger.push({ type: 'PAYMENT', date: alloc.payment.paidAt, description: 'Payment - ' + (alloc.payment.mpesaReference || 'Manual'), amount: -Number(alloc.amountApplied), balance: runningBalance });
      }
    }
    return { tenant, ledger: ledger.reverse(), currentBalance: runningBalance };
  }
}
