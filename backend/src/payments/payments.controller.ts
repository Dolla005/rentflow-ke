import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Payments') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('payments')
export class PaymentsController {
  constructor(private readonly svc: PaymentsService) {}
  @Get() findAll(@CurrentUser() u: RequestUser, @Query() filters: any) { return this.svc.findAll(u.landlordId, filters); }
  @Get('unmatched') getUnmatched(@CurrentUser() u: RequestUser) { return this.svc.getUnmatched(u.landlordId); }
  @Post() record(@CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.recordManual(u.landlordId, dto, u.id); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() u: RequestUser) { return this.svc.findOne(id, u.landlordId); }
  @Post(':id/reverse') reverse(@Param('id') id: string, @CurrentUser() u: RequestUser, @Body('reason') reason: string) { return this.svc.reverse(id, u.landlordId, reason, u.id); }
  @Post('unmatched/:id/resolve') resolve(@Param('id') id: string, @CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.resolveUnmatched(id, u.landlordId, dto, u.id); }
}
