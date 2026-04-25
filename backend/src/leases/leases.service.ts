import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
const { Decimal } = require('@prisma/client/runtime/library');

@Injectable()
export class LeasesService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(landlordId: string) {
    return this.prisma.lease.findMany({ where: { landlordId }, include: { tenant: true, unit: { include: { property: true } }, _count: { select: { rentCharges: true, payments: true } } }, orderBy: { createdAt: 'desc' } });
  }
  async findOne(id: string, landlordId: string) {
    const l = await this.prisma.lease.findFirst({ where: { id, landlordId }, include: { tenant: true, unit: { include: { property: true } }, rentCharges: { orderBy: { billingPeriod: 'desc' }, take: 12 }, payments: { orderBy: { paidAt: 'desc' }, take: 20 } } });
    if (!l) throw new NotFoundException('Lease not found');
    return l;
  }
  async create(landlordId: string, dto: any) {
    const [tenant, unit] = await Promise.all([
      this.prisma.tenant.findFirst({ where: { id: dto.tenantId, landlordId } }),
      this.prisma.unit.findFirst({ where: { id: dto.unitId, property: { landlordId } } }),
    ]);
    if (!tenant) throw new NotFoundException('Tenant not found');
    if (!unit) throw new NotFoundException('Unit not found');
    if (await this.prisma.lease.findFirst({ where: { unitId: dto.unitId, status: 'ACTIVE' } })) throw new BadRequestException('Unit already has an active lease');
    const property = await this.prisma.property.findUnique({ where: { id: unit.propertyId } });
    const landlord = await this.prisma.landlord.findUnique({ where: { id: landlordId } });
    const accountReference = landlord.accountPrefix + '-' + property.code + '-' + unit.unitNumber;
    return this.prisma.$transaction(async (tx) => {
      const lease = await tx.lease.create({ data: { landlordId, tenantId: dto.tenantId, unitId: dto.unitId, accountReference, monthlyRent: new Decimal(dto.monthlyRent), depositAmount: new Decimal(dto.depositAmount || 0), depositPaid: dto.depositPaid || false, paymentDueDay: dto.paymentDueDay || 1, startDate: new Date(dto.startDate), endDate: dto.endDate ? new Date(dto.endDate) : null, status: 'ACTIVE', notes: dto.notes }, include: { tenant: true, unit: { include: { property: true } } } });
      await tx.unit.update({ where: { id: dto.unitId }, data: { status: 'OCCUPIED' } });
      const now = new Date();
      const billingPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
      const dueDate = new Date(now.getFullYear(), now.getMonth(), dto.paymentDueDay || 1);
      await tx.rentCharge.create({ data: { leaseId: lease.id, tenantId: dto.tenantId, landlordId, amountDue: new Decimal(dto.monthlyRent), amountPaid: new Decimal(0), balance: new Decimal(dto.monthlyRent), billingPeriod, dueDate, status: 'UNPAID' } });
      return lease;
    });
  }
  async terminate(id: string, landlordId: string, reason: string) {
    const lease = await this.findOne(id, landlordId);
    if (lease.status !== 'ACTIVE') throw new BadRequestException('Lease is not active');
    return this.prisma.$transaction(async (tx) => {
      await tx.lease.update({ where: { id }, data: { status: 'TERMINATED', terminatedAt: new Date(), terminationReason: reason } });
      await tx.unit.update({ where: { id: lease.unitId }, data: { status: 'VACANT' } });
      return { message: 'Lease terminated' };
    });
  }
  async update(id: string, landlordId: string, dto: any) {
    await this.findOne(id, landlordId);
    return this.prisma.lease.update({ where: { id }, data: dto });
  }
}
