"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async sendReminders() {
        const today = new Date();
        const in3days = new Date(today.getTime() + 3 * 86400000);
        const preDue = await this.prisma.rentCharge.findMany({ where: { status: { in: ['UNPAID', 'PARTIAL'] }, dueDate: { gte: today, lte: in3days } }, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } } } });
        for (const c of preDue) {
            await this.sendNotification(c.landlordId, c.tenantId, 'PAYMENT_REMINDER_PRE', 'Dear ' + c.tenant.firstName + ', your rent of KES ' + Number(c.amountDue).toLocaleString() + ' is due on ' + c.dueDate.toDateString() + '. Account: ' + c.lease.accountReference, c.tenant.phone, c.tenant.email);
        }
        const overdue = await this.prisma.rentCharge.findMany({ where: { status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] }, dueDate: { lt: today } }, include: { tenant: true, lease: true } });
        for (const c of overdue) {
            await this.sendNotification(c.landlordId, c.tenantId, 'PAYMENT_REMINDER_OVERDUE', 'Dear ' + c.tenant.firstName + ', your rent of KES ' + Number(c.balance).toLocaleString() + ' is OVERDUE. Please pay immediately.', c.tenant.phone, c.tenant.email);
        }
        this.logger.log('Reminders: ' + preDue.length + ' pre-due, ' + overdue.length + ' overdue');
    }
    async sendNotification(landlordId, tenantId, type, message, phone, email) {
        const tasks = [];
        if (phone)
            tasks.push(this.prisma.notification.create({ data: { landlordId, tenantId, type, channel: 'SMS', recipient: phone, message, status: 'PENDING' } }));
        if (email)
            tasks.push(this.prisma.notification.create({ data: { landlordId, tenantId, type, channel: 'EMAIL', recipient: email, subject: 'RentFlow KE - ' + type.replace(/_/g, ' '), message, status: 'PENDING' } }));
        await Promise.all(tasks);
    }
    async getLogs(landlordId) {
        return this.prisma.notification.findMany({ where: { landlordId }, include: { tenant: true }, orderBy: { createdAt: 'desc' }, take: 100 });
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)('0 7 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "sendReminders", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map