import { PrismaService } from '../prisma/prisma.service';
export declare class BillingService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    generateMonthlyCharges(): Promise<{
        generated: number;
    }>;
    applyLateFees(): Promise<void>;
    manualGenerate(landlordId: string, month?: string): Promise<{
        generated: number;
        period: Date;
    }>;
    getCharges(landlordId: string, filters?: any): Promise<any>;
}
