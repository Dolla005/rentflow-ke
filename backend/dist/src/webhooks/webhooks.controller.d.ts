import { WebhooksService } from './webhooks.service';
export declare class WebhooksController {
    private readonly svc;
    constructor(svc: WebhooksService);
    validation(): {
        ResultCode: number;
        ResultDesc: string;
    };
    confirmation(payload: any): Promise<{
        ResultCode: number;
        ResultDesc: string;
    }>;
}
