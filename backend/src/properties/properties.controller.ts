import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PropertiesService } from './properties.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Properties') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('properties')
export class PropertiesController {
  constructor(private readonly svc: PropertiesService) {}
  @Get() findAll(@CurrentUser() u: RequestUser) { return this.svc.findAll(u.landlordId); }
  @Post() create(@CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.create(u.landlordId, dto); }
  @Get(':id') findOne(@Param('id') id: string, @CurrentUser() u: RequestUser) { return this.svc.findOne(id, u.landlordId); }
  @Patch(':id') update(@Param('id') id: string, @CurrentUser() u: RequestUser, @Body() dto: any) { return this.svc.update(id, u.landlordId, dto); }
  @Delete(':id') remove(@Param('id') id: string, @CurrentUser() u: RequestUser) { return this.svc.remove(id, u.landlordId); }
}
