import { NotificationsService } from './notifications.service';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class NotificationsController {
    private readonly svc;
    constructor(svc: NotificationsService);
    getLogs(u: RequestUser): Promise<any>;
}
