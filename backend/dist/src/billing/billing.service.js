"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
const { Decimal } = require('@prisma/client/runtime/library');
let BillingService = BillingService_1 = class BillingService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(BillingService_1.name);
    }
    async generateMonthlyCharges() {
        this.logger.log('Running monthly charge generation...');
        const leases = await this.prisma.lease.findMany({ where: { status: 'ACTIVE' } });
        const now = new Date();
        const billingPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
        let created = 0;
        for (const lease of leases) {
            const exists = await this.prisma.rentCharge.findUnique({ where: { leaseId_billingPeriod: { leaseId: lease.id, billingPeriod } } });
            if (exists)
                continue;
            const dueDate = new Date(now.getFullYear(), now.getMonth(), lease.paymentDueDay);
            await this.prisma.rentCharge.create({ data: { leaseId: lease.id, tenantId: lease.tenantId, landlordId: lease.landlordId, amountDue: lease.monthlyRent, amountPaid: new Decimal(0), balance: lease.monthlyRent, billingPeriod, dueDate, status: 'UNPAID' } });
            created++;
        }
        this.logger.log('Monthly charges generated: ' + created);
        return { generated: created };
    }
    async applyLateFees() {
        const today = new Date();
        const landlords = await this.prisma.landlord.findMany({ where: { isActive: true }, include: { lateFeeRules: { where: { isActive: true } } } });
        let applied = 0;
        for (const landlord of landlords) {
            if (!landlord.lateFeeRules.length)
                continue;
            const rule = landlord.lateFeeRules[0];
            const cutoff = new Date(today.getTime() - rule.gracePeriodDays * 86400000);
            const overdue = await this.prisma.rentCharge.findMany({ where: { landlordId: landlord.id, status: { in: ['UNPAID', 'PARTIAL'] }, dueDate: { lt: cutoff } } });
            for (const charge of overdue) {
                const alreadyApplied = await this.prisma.lateFeeCharge.findFirst({ where: { rentChargeId: charge.id, appliedDate: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } } });
                if (alreadyApplied && !rule.isRecurring)
                    continue;
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
    async manualGenerate(landlordId, month) {
        const date = month ? new Date(month) : new Date();
        const billingPeriod = new Date(date.getFullYear(), date.getMonth(), 1);
        const leases = await this.prisma.lease.findMany({ where: { landlordId, status: 'ACTIVE' } });
        let created = 0;
        for (const lease of leases) {
            const exists = await this.prisma.rentCharge.findUnique({ where: { leaseId_billingPeriod: { leaseId: lease.id, billingPeriod } } });
            if (exists)
                continue;
            const dueDate = new Date(date.getFullYear(), date.getMonth(), lease.paymentDueDay);
            await this.prisma.rentCharge.create({ data: { leaseId: lease.id, tenantId: lease.tenantId, landlordId, amountDue: lease.monthlyRent, amountPaid: new Decimal(0), balance: lease.monthlyRent, billingPeriod, dueDate, status: 'UNPAID' } });
            created++;
        }
        return { generated: created, period: billingPeriod };
    }
    async getCharges(landlordId, filters = {}) {
        const where = { landlordId };
        if (filters.status)
            where.status = filters.status;
        if (filters.tenantId)
            where.tenantId = filters.tenantId;
        if (filters.month) {
            const d = new Date(filters.month);
            where.billingPeriod = new Date(d.getFullYear(), d.getMonth(), 1);
        }
        return this.prisma.rentCharge.findMany({ where, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } }, lateFees: true }, orderBy: [{ billingPeriod: 'desc' }, { tenant: { lastName: 'asc' } }] });
    }
};
exports.BillingService = BillingService;
__decorate([
    (0, schedule_1.Cron)('1 0 1 * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingService.prototype, "generateMonthlyCharges", null);
__decorate([
    (0, schedule_1.Cron)('0 8 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BillingService.prototype, "applyLateFees", null);
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillingService);
//# sourceMappingURL=billing.service.js.map