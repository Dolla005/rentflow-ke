import { PropertiesService } from './properties.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class PropertiesController {
    private readonly svc;
    constructor(svc: PropertiesService);
    findAll(u: RequestUser): Promise<any>;
    create(u: RequestUser, dto: any): Promise<any>;
    findOne(id: string, u: RequestUser): Promise<any>;
    update(id: string, u: RequestUser, dto: any): Promise<any>;
    remove(id: string, u: RequestUser): Promise<{
        message: string;
    }>;
}
