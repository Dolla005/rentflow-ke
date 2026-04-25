import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(landlordId: string, filters?: any): Promise<any>;
    findOne(id: string, landlordId: string): Promise<any>;
    allocatePayment(landlordId: string, leaseId: string, tenantId: string, amount: number, meta: any): Promise<any>;
    recordManual(landlordId: string, dto: any, recordedById: string): Promise<any>;
    reverse(id: string, landlordId: string, reason: string, userId: string): Promise<any>;
    getUnmatched(landlordId: string): Promise<any>;
    resolveUnmatched(id: string, landlordId: string, dto: any, userId: string): Promise<{
        message: string;
    }>;
}
