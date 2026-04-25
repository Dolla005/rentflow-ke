import { PrismaService } from '../prisma/prisma.service';
export declare class LandlordsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<any>;
    findOne(id: string): Promise<any>;
    create(dto: any): Promise<any>;
    update(id: string, dto: any): Promise<any>;
    getDashboard(landlordId: string): Promise<{
        properties: any;
        units: {
            total: any;
            occupied: any;
            vacant: any;
        };
        rent: {
            expected: number;
            collected: number;
            outstanding: number;
            collectionRate: number;
        };
        overdueCharges: any;
        recentPayments: any;
        unpaidTenants: any;
    }>;
    getUsers(landlordId: string): Promise<any>;
}
