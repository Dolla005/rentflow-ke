import { PrismaService } from '../prisma/prisma.service';
export declare class UnitsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(landlordId: string, propertyId?: string): Promise<any>;
    findOne(id: string, landlordId: string): Promise<any>;
    create(landlordId: string, dto: any): Promise<any>;
    update(id: string, landlordId: string, dto: any): Promise<any>;
    getAvailable(landlordId: string): Promise<any>;
}
