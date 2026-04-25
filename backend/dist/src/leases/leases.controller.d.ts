import { LeasesService } from './leases.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class LeasesController {
    private readonly svc;
    constructor(svc: LeasesService);
    findAll(u: RequestUser): Promise<any>;
    create(u: RequestUser, dto: any): Promise<any>;
    findOne(id: string, u: RequestUser): Promise<any>;
    update(id: string, u: RequestUser, dto: any): Promise<any>;
    terminate(id: string, u: RequestUser, reason: string): Promise<any>;
}
