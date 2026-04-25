import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
const { Decimal } = require('@prisma/client/runtime/library');

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron('1 0 1 * *')
  async generateMonthlyCharges() {
    this.logger.log('Running monthly charge generation...');
    const leases = await this.prisma.lease.findMany({ where: { status: 'ACTIVE' } });
    const now = new Date();
    const billingPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
    let created = 0;
    for (const lease of leases) {
      const exists = await this.prisma.rentCharge.findUnique({ where: { leaseId_billingPeriod: { leaseId: lease.id, billingPeriod } } });
      if (exists) continue;
      const dueDate = new Date(now.getFullYear(), now.getMonth(), lease.paymentDueDay);
      await this.prisma.rentCharge.create({ data: { leaseId: lease.id, tenantId: lease.tenantId, landlordId: lease.landlordId, amountDue: lease.monthlyRent, amountPaid: new Decimal(0), balance: lease.monthlyRent, billingPeriod, dueDate, status: 'UNPAID' } });
      created++;
    }
    this.logger.log('Monthly charges generated: ' + created);
    return { generated: created };
  }

  @Cron('0 8 * * *')
  async applyLateFees() {
    const today = new Date();
    const landlords = await this.prisma.landlord.findMany({ where: { isActive: true }, include: { lateFeeRules: { where: { isActive: true } } } });
    let applied = 0;
    for (const landlord of landlords) {
      if (!landlord.lateFeeRules.length) continue;
      const rule = landlord.lateFeeRules[0];
      const cutoff = new Date(today.getTime() - rule.gracePeriodDays * 86400000);
      const overdue = await this.prisma.rentCharge.findMany({ where: { landlordId: landlord.id, status: { in: ['UNPAID', 'PARTIAL'] }, dueDate: { lt: cutoff } } });
      for (const charge of overdue) {
        const alreadyApplied = await this.prisma.lateFeeCharge.findFirst({ where: { rentChargeId: charge.id, appliedDate: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } } });
        if (alreadyApplied && !rule.isRecurring) continue;
        const feeAmount = rule.feeType === 'FIXED' ? Number(rule.feeValue) : (Number(charge.balance) * Number(rule.feeValue)) / 100;
        await this.prisma.$transaction(async (tx) => {
          await tx.lateFeeCharge.create({ data: { rentChargeId: charge.id, ruleId: rule.id, amount: new Decimal(feeAmount), appliedDate: today } });
          await tx.rentCharge.update({ where: { id: charge.id }, data: { balance: { increment: feeAmount }, status: 'OVERDUE' } });
        });
        applied++;
      }
    }
    this.logger.log('Late fees applied: ' + applied);
  }

  async manualGenerate(landlordId: string, month?: string) {
    const date = month ? new Date(month) : new Date();
    const billingPeriod = new Date(date.getFullYear(), date.getMonth(), 1);
    const leases = await this.prisma.lease.findMany({ where: { landlordId, status: 'ACTIVE' } });
    let created = 0;
    for (const lease of leases) {
      const exists = await this.prisma.rentCharge.findUnique({ where: { leaseId_billingPeriod: { leaseId: lease.id, billingPeriod } } });
      if (exists) continue;
      const dueDate = new Date(date.getFullYear(), date.getMonth(), lease.paymentDueDay);
      await this.prisma.rentCharge.create({ data: { leaseId: lease.id, tenantId: lease.tenantId, landlordId, amountDue: lease.monthlyRent, amountPaid: new Decimal(0), balance: lease.monthlyRent, billingPeriod, dueDate, status: 'UNPAID' } });
      created++;
    }
    return { generated: created, period: billingPeriod };
  }

  async getCharges(landlordId: string, filters: any = {}) {
    const where: any = { landlordId };
    if (filters.status) where.status = filters.status;
    if (filters.tenantId) where.tenantId = filters.tenantId;
    if (filters.month) { const d = new Date(filters.month); where.billingPeriod = new Date(d.getFullYear(), d.getMonth(), 1); }
    return this.prisma.rentCharge.findMany({ where, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } }, lateFees: true }, orderBy: [{ billingPeriod: 'desc' }, { tenant: { lastName: 'asc' } }] });
  }
}
