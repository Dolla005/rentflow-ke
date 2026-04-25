import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
const { Decimal } = require('@prisma/client/runtime/library');

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  constructor(private readonly prisma: PrismaService, private readonly payments: PaymentsService) {}

  async handleMpesa(payload: any) {
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
    } catch (err) { this.logger.error('Allocation error for ' + ref + ': ' + err.message); }
    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  private async findLandlordId(payload: any): Promise<string> {
    if (payload.BusinessShortCode) {
      const l = await this.prisma.landlord.findFirst({ where: { paybillNumber: String(payload.BusinessShortCode) } });
      if (l) return l.id;
    }
    const first = await this.prisma.landlord.findFirst({ orderBy: { createdAt: 'asc' } });
    return first?.id;
  }
}
