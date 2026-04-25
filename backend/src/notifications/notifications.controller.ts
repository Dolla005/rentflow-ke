import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Notifications') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('notifications')
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}
  @Get() getLogs(@CurrentUser() u: RequestUser) { return this.svc.getLogs(u.landlordId); }
}
