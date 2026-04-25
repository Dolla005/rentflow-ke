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
var WebhooksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const payments_service_1 = require("../payments/payments.service");
const { Decimal } = require('@prisma/client/runtime/library');
let WebhooksService = WebhooksService_1 = class WebhooksService {
    constructor(prisma, payments) {
        this.prisma = prisma;
        this.payments = payments;
        this.logger = new common_1.Logger(WebhooksService_1.name);
    }
    async handleMpesa(payload) {
        const ref = payload.TransID;
        const accountNumber = (payload.BillRefNumber || '').toUpperCase().trim();
        const amount = parseFloat(payload.TransAmount);
        const phone = payload.MSISDN;
        this.logger.log('M-Pesa webhook: ' + ref + ' | ' + accountNumber + ' | KES ' + amount);
        if (await this.prisma.payment.findFirst({ where: { mpesaReference: ref } })) {
            this.logger.warn('Duplicate M-Pesa ref ignored: ' + ref);
            return { ResultCode: 0, ResultDesc: 'Accepted' };
        }
        const lease = await this.prisma.lease.findUnique({ where: { accountReference: accountNumber }, include: { landlord: true } });
        if (!lease || lease.status !== 'ACTIVE') {
            const landlordId = await this.findLandlordId(payload);
            await this.prisma.unmatchedPayment.create({ data: { landlordId, rawReference: ref, accountNumber, amount: new Decimal(amount), phoneFrom: phone, provider: 'MPESA', rawPayload: payload, resolutionStatus: 'PENDING' } });
            this.logger.warn('Unmatched payment stored: ' + ref);
            return { ResultCode: 0, ResultDesc: 'Accepted' };
        }
        try {
            await this.payments.allocatePayment(lease.landlordId, lease.id, lease.tenantId, amount, { mpesaReference: ref, accountNumber, phoneFrom: phone, provider: 'MPESA', paidAt: new Date() });
        }
        catch (err) {
            this.logger.error('Allocation error for ' + ref + ': ' + err.message);
        }
        return { ResultCode: 0, ResultDesc: 'Accepted' };
    }
    async findLandlordId(payload) {
        if (payload.BusinessShortCode) {
            const l = await this.prisma.landlord.findFirst({ where: { paybillNumber: String(payload.BusinessShortCode) } });
            if (l)
                return l.id;
        }
        const first = await this.prisma.landlord.findFirst({ orderBy: { createdAt: 'asc' } });
        return first?.id;
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, payments_service_1.PaymentsService])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map