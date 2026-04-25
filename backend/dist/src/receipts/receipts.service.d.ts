import { PrismaService } from '../prisma/prisma.service';
export declare class ReceiptsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(landlordId: string, tenantId?: string): Promise<any>;
    findOne(id: string, landlordId: string): Promise<any>;
}
