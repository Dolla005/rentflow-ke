import { ReceiptsService } from './receipts.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class ReceiptsController {
    private readonly svc;
    constructor(svc: ReceiptsService);
    findAll(u: RequestUser, tenantId?: string): Promise<any>;
    findOne(id: string, u: RequestUser): Promise<any>;
}
