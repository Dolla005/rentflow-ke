import { TenantsService } from './tenants.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class TenantsController {
    private readonly svc;
    constructor(svc: TenantsService);
    findAll(u: RequestUser): Promise<any>;
    create(u: RequestUser, dto: any): Promise<any>;
    findOne(id: string, u: RequestUser): Promise<any>;
    update(id: string, u: RequestUser, dto: any): Promise<any>;
    getLedger(id: string, u: RequestUser): Promise<{
        tenant: any;
        ledger: any[];
        currentBalance: number;
    }>;
}
