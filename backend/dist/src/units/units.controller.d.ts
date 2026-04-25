import { UnitsService } from './units.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class UnitsController {
    private readonly svc;
    constructor(svc: UnitsService);
    findAll(u: RequestUser, propertyId?: string): Promise<any>;
    getAvailable(u: RequestUser): Promise<any>;
    create(u: RequestUser, dto: any): Promise<any>;
    findOne(id: string, u: RequestUser): Promise<any>;
    update(id: string, u: RequestUser, dto: any): Promise<any>;
}
