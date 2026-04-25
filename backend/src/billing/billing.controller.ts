import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Billing') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('billing')
export class BillingController {
  constructor(private readonly svc: BillingService) {}
  @Get('charges') getCharges(@CurrentUser() u: RequestUser, @Query() filters: any) { return this.svc.getCharges(u.landlordId, filters); }
  @Post('generate') generate(@CurrentUser() u: RequestUser, @Body('month') month?: string) { return this.svc.manualGenerate(u.landlordId, month); }
}
