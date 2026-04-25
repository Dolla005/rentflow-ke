import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks') @Controller('webhooks')
export class WebhooksController {
  constructor(private readonly svc: WebhooksService) {}
  @Post('mpesa/validation') @HttpCode(200) validation() { return { ResultCode: 0, ResultDesc: 'Accepted' }; }
  @Post('mpesa/confirmation') @HttpCode(200) confirmation(@Body() payload: any) { return this.svc.handleMpesa(payload); }
}
