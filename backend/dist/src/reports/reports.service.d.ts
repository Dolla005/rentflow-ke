import { PrismaService } from '../prisma/prisma.service';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    collectionSummary(landlordId: string, month?: string): Promise<{
        period: Date;
        totalExpected: number;
        totalCollected: number;
        totalOutstanding: number;
        totalLateFees: number;
        paymentCount: any;
        collectionRate: number;
        byStatus: any;
    }>;
    arrearsReport(landlordId: string): Promise<any>;
    propertyPerformance(landlordId: string): Promise<any>;
}
