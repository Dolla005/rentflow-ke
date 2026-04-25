import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LandlordsService } from './landlords.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Landlords') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('landlords')
export class LandlordsController {
  constructor(private readonly svc: LandlordsService) {}
  @Get() @Roles(UserRole.SUPER_ADMIN) findAll() { return this.svc.findAll(); }
  @Post() @Roles(UserRole.SUPER_ADMIN) create(@Body() dto: any) { return this.svc.create(dto); }
  @Get('dashboard') getDashboard(@CurrentUser() u: RequestUser) { return this.svc.getDashboard(u.landlordId); }
  @Get(':id') findOne(@Param('id') id: string) { return this.svc.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: any) { return this.svc.update(id, dto); }
  @Get(':id/users') getUsers(@Param('id') id: string) { return this.svc.getUsers(id); }
}
