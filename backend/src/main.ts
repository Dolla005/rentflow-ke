import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  const config = new DocumentBuilder().setTitle('RentFlow KE API').setDescription('Rent Automation Management System').setVersion('1.0').addBearerAuth().build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log('RentFlow API running on port ' + port);
  logger.log('Swagger docs at http://localhost:' + port + '/api/docs');
}
bootstrap();
