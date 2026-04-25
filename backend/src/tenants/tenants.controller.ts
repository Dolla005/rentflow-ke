import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Tenants') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('tenants')
export class TenantsController {
  constructor(private readonly svc: TenantsService) {}
  @Get() findAll(@CurrentUser() u: RequestUser) { return this.svc.findAll(u.landlordId); }
  @Post() create(@CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.create(u.landlordId, dto); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() u: RequestUser) { return this.svc.findOne(id, u.landlordId); }
  @Patch(':id') update(@Param('id') id: string, @CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.update(id, u.landlordId, dto); }
  @Get(':id/ledger') getLedger(@Param('id') id: string, @CurrentUser() u: RequestUser) { return this.svc.getLedger(id, u.landlordId); }
}
