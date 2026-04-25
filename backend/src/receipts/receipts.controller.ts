import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReceiptsService } from './receipts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Receipts') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('receipts')
export class ReceiptsController {
  constructor(private readonly svc: ReceiptsService) {}
  @Get() findAll(@CurrentUser() u: RequestUser, @Query('tenantId') tenantId?: string) { return this.svc.findAll(u.landlordId, tenantId); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() u: RequestUser) { return this.svc.findOne(id, u.landlordId); }
}
