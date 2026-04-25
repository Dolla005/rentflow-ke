import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Units') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('units')
export class UnitsController {
  constructor(private readonly svc: UnitsService) {}
  @Get() findAll(@CurrentUser() u: RequestUser, @Query('propertyId') propertyId?: string) { return this.svc.findAll(u.landlordId, propertyId); }
  @Get('available') getAvailable(@CurrentUser() u: RequestUser) { return this.svc.getAvailable(u.landlordId); }
  @Post() create(@CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.create(u.landlordId, dto); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() u: RequestUser) { return this.svc.findOne(id, u.landlordId); }
  @Patch(':id') update(@Param('id') id: string, @CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.update(id, u.landlordId, dto); }
}
