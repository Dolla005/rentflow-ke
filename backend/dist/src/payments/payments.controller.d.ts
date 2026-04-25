import { PaymentsService } from './payments.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class PaymentsController {
    private readonly svc;
    constructor(svc: PaymentsService);
    findAll(u: RequestUser, filters: any): Promise<any>;
    getUnmatched(u: RequestUser): Promise<any>;
    record(u: RequestUser, dto: any): Promise<any>;
    findOne(id: string, u: RequestUser): Promise<any>;
    reverse(id: string, u: RequestUser, reason: string): Promise<any>;
    resolve(id: string, u: RequestUser, dto: any): Promise<{
        message: string;
    }>;
}
