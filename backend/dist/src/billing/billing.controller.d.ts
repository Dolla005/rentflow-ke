import { BillingService } from './billing.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class BillingController {
    private readonly svc;
    constructor(svc: BillingService);
    getCharges(u: RequestUser, filters: any): Promise<any>;
    generate(u: RequestUser, month?: string): Promise<{
        generated: number;
        period: Date;
    }>;
}
