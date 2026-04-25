import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Leases') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('leases')
export class LeasesController {
  constructor(private readonly svc: LeasesService) {}
  @Get() findAll(@CurrentUser() u: RequestUser) { return this.svc.findAll(u.landlordId); }
  @Post() create(@CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.create(u.landlordId, dto); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() u: RequestUser) { return this.svc.findOne(id, u.landlordId); }
  @Patch(':id') update(@Param('id') id: string, @CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.update(id, u.landlordId, dto); }
  @Post(':id/terminate') terminate(@Param('id') id: string, @CurrentUser() u: RequestUser, @Body('reason') reason: string) { return this.svc.terminate(id, u.landlordId, reason || 'Terminated by landlord'); }
}
