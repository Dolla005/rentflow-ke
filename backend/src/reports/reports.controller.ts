import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Reports') @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Controller('reports')
export class ReportsController {
  constructor(private readonly svc: ReportsService) {}
  @Get('collection') collection(@CurrentUser() u: RequestUser, @Query('month') month?: string) { return this.svc.collectionSummary(u.landlordId, month); }
  @Get('arrears') arrears(@CurrentUser() u: RequestUser) { return this.svc.arrearsReport(u.landlordId); }
  @Get('property-performance') performance(@CurrentUser() u: RequestUser) { return this.svc.propertyPerformance(u.landlordId); }
}
