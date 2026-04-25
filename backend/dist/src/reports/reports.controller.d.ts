import { ReportsService } from './reports.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class ReportsController {
    private readonly svc;
    constructor(svc: ReportsService);
    collection(u: RequestUser, month?: string): Promise<{
        period: Date;
        totalExpected: number;
        totalCollected: number;
        totalOutstanding: number;
        totalLateFees: number;
        paymentCount: any;
        collectionRate: number;
        byStatus: any;
    }>;
    arrears(u: RequestUser): Promise<any>;
    performance(u: RequestUser): Promise<any>;
}
