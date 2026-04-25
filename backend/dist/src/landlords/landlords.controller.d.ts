import { LandlordsService } from './landlords.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class LandlordsController {
    private readonly svc;
    constructor(svc: LandlordsService);
    findAll(): Promise<any>;
    create(dto: any): Promise<any>;
    getDashboard(u: RequestUser): Promise<{
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
    findOne(id: string): Promise<any>;
    update(id: string, dto: any): Promise<any>;
    getUsers(id: string): Promise<any>;
}
