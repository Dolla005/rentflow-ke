import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
export declare class WebhooksService {
    private readonly prisma;
    private readonly payments;
    private readonly logger;
    constructor(prisma: PrismaService, payments: PaymentsService);
    handleMpesa(payload: any): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
    private findLandlordId;
}
