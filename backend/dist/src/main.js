"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'], credentials: true });
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    const config = new swagger_1.DocumentBuilder().setTitle('RentFlow KE API').setDescription('Rent Automation Management System').setVersion('1.0').addBearerAuth().build();
    swagger_1.SwaggerModule.setup('api/docs', app, swagger_1.SwaggerModule.createDocument(app, config));
    const port = process.env.PORT || 3001;
    await app.listen(port);
    logger.log('RentFlow API running on port ' + port);
    logger.log('Swagger docs at http://localhost:' + port + '/api/docs');
}
bootstrap();
//# sourceMappingURL=main.js.map