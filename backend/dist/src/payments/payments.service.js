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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const { Decimal } = require('@prisma/client/runtime/library');
let PaymentsService = class PaymentsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(landlordId, filters = {}) {
        const where = { landlordId, isReversed: false };
        if (filters.tenantId)
            where.tenantId = filters.tenantId;
        if (filters.leaseId)
            where.leaseId = filters.leaseId;
        return this.prisma.payment.findMany({ where, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } }, receipt: true, allocations: { include: { rentCharge: true } } }, orderBy: { paidAt: 'desc' } });
    }
    async findOne(id, landlordId) {
        const p = await this.prisma.payment.findFirst({ where: { id, landlordId }, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } }, receipt: true, allocations: { include: { rentCharge: true } } } });
        if (!p)
            throw new common_1.NotFoundException('Payment not found');
        return p;
    }
    async allocatePayment(landlordId, leaseId, tenantId, amount, meta) {
        const lease = await this.prisma.lease.findFirst({ where: { id: leaseId, landlordId } });
        if (!lease)
            throw new common_1.NotFoundException('Lease not found');
        return this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({ data: { landlordId, tenantId, leaseId, amount: new Decimal(amount), mpesaReference: meta.mpesaReference, accountNumber: meta.accountNumber, phoneFrom: meta.phoneFrom, provider: meta.provider || 'MPESA', matchStatus: 'MATCHED', recordedById: meta.recordedById, notes: meta.notes, paidAt: meta.paidAt || new Date() } });
            const unpaid = await tx.rentCharge.findMany({ where: { leaseId, status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } }, orderBy: { billingPeriod: 'asc' } });
            let remaining = amount;
            for (const charge of unpaid) {
                if (remaining <= 0)
                    break;
                const apply = Math.min(remaining, Number(charge.balance));
                await tx.paymentAllocation.create({ data: { paymentId: payment.id, rentChargeId: charge.id, amountApplied: new Decimal(apply) } });
                const newBalance = Number(charge.balance) - apply;
                await tx.rentCharge.update({ where: { id: charge.id }, data: { amountPaid: { increment: apply }, balance: new Decimal(newBalance), status: newBalance <= 0 ? 'PAID' : 'PARTIAL' } });
                remaining -= apply;
            }
            const outstandingCharges = await tx.rentCharge.findMany({ where: { leaseId, status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] } } });
            const balanceAfter = outstandingCharges.reduce((s, c) => s + Number(c.balance), 0);
            await tx.receipt.create({ data: { landlordId, paymentId: payment.id, tenantId, receiptNumber: 'RFT-' + Date.now(), amountPaid: new Decimal(amount), balanceAfter: new Decimal(balanceAfter) } });
            return { payment, balanceAfter, excessAmount: remaining };
        });
    }
    async recordManual(landlordId, dto, recordedById) {
        const lease = await this.prisma.lease.findFirst({ where: { id: dto.leaseId, landlordId } });
        if (!lease)
            throw new common_1.NotFoundException('Lease not found');
        return this.allocatePayment(landlordId, dto.leaseId, lease.tenantId, Number(dto.amount), { mpesaReference: dto.mpesaReference, phoneFrom: dto.phone, provider: dto.provider || 'CASH', paidAt: dto.paidAt ? new Date(dto.paidAt) : new Date(), recordedById, notes: dto.notes });
    }
    async reverse(id, landlordId, reason, userId) {
        const payment = await this.findOne(id, landlordId);
        if (payment.isReversed)
            throw new common_1.BadRequestException('Already reversed');
        return this.prisma.$transaction(async (tx) => {
            for (const alloc of payment.allocations) {
                await tx.rentCharge.update({ where: { id: alloc.rentChargeId }, data: { amountPaid: { decrement: Number(alloc.amountApplied) }, balance: { increment: Number(alloc.amountApplied) } } });
                const charge = await tx.rentCharge.findUnique({ where: { id: alloc.rentChargeId } });
                const status = Number(charge.balance) <= 0 ? 'PAID' : Number(charge.amountPaid) > 0 ? 'PARTIAL' : 'UNPAID';
                await tx.rentCharge.update({ where: { id: charge.id }, data: { status } });
            }
            await tx.payment.update({ where: { id }, data: { isReversed: true, reversedAt: new Date(), reversalReason: reason } });
            await tx.auditLog.create({ data: { userId, landlordId, action: 'PAYMENT_REVERSE', entityType: 'Payment', entityId: id, afterState: { reason } } });
            return { message: 'Payment reversed' };
        });
    }
    async getUnmatched(landlordId) {
        return this.prisma.unmatchedPayment.findMany({ where: { landlordId, resolutionStatus: 'PENDING' }, orderBy: { receivedAt: 'desc' } });
    }
    async resolveUnmatched(id, landlordId, dto, userId) {
        const unmatched = await this.prisma.unmatchedPayment.findFirst({ where: { id, landlordId } });
        if (!unmatched)
            throw new common_1.NotFoundException('Not found');
        const lease = await this.prisma.lease.findFirst({ where: { id: dto.leaseId, landlordId } });
        if (!lease)
            throw new common_1.NotFoundException('Lease not found');
        await this.allocatePayment(landlordId, dto.leaseId, lease.tenantId, Number(unmatched.amount), { mpesaReference: unmatched.rawReference, accountNumber: unmatched.accountNumber, phoneFrom: unmatched.phoneFrom, provider: unmatched.provider, paidAt: unmatched.receivedAt, recordedById: userId, notes: 'Resolved from unmatched queue' });
        await this.prisma.unmatchedPayment.update({ where: { id }, data: { resolutionStatus: 'RESOLVED', resolvedById: userId, resolvedAt: new Date(), resolutionNote: dto.note } });
        return { message: 'Resolved and allocated' };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map