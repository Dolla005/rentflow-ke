import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    sendReminders(): Promise<void>;
    sendNotification(landlordId: string, tenantId: string, type: any, message: string, phone?: string, email?: string): Promise<void>;
    getLogs(landlordId: string): Promise<any>;
}
