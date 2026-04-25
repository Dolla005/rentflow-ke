import { PrismaService } from '../prisma/prisma.service';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(landlordId: string): Promise<any>;
    findOne(id: string, landlordId: string): Promise<any>;
    create(landlordId: string, dto: any): Promise<any>;
    update(id: string, landlordId: string, dto: any): Promise<any>;
    getLedger(id: string, landlordId: string): Promise<{
        tenant: any;
        ledger: any[];
        currentBalance: number;
    }>;
}
