import { PrismaService } from '../prisma/prisma.service';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(landlordId: string): Promise<any>;
    findOne(id: string, landlordId: string): Promise<any>;
    create(landlordId: string, dto: any): Promise<any>;
    update(id: string, landlordId: string, dto: any): Promise<any>;
    remove(id: string, landlordId: string): Promise<{
        message: string;
    }>;
}
