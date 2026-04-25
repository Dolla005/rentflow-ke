import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  constructor(private readonly prisma: PrismaService) {}

  @Cron('0 7 * * *')
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

  async sendNotification(landlordId: string, tenantId: string, type: any, message: string, phone?: string, email?: string) {
    const tasks = [];
    if (phone) tasks.push(this.prisma.notification.create({ data: { landlordId, tenantId, type, channel: 'SMS', recipient: phone, message, status: 'PENDING' } }));
    if (email) tasks.push(this.prisma.notification.create({ data: { landlordId, tenantId, type, channel: 'EMAIL', recipient: email, subject: 'RentFlow KE - ' + type.replace(/_/g, ' '), message, status: 'PENDING' } }));
    await Promise.all(tasks);
  }

  async getLogs(landlordId: string) {
    return this.prisma.notification.findMany({ where: { landlordId }, include: { tenant: true }, orderBy: { createdAt: 'desc' }, take: 100 });
  }
}
