"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const landlords_module_1 = require("./landlords/landlords.module");
const properties_module_1 = require("./properties/properties.module");
const units_module_1 = require("./units/units.module");
const tenants_module_1 = require("./tenants/tenants.module");
const leases_module_1 = require("./leases/leases.module");
const billing_module_1 = require("./billing/billing.module");
const payments_module_1 = require("./payments/payments.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const receipts_module_1 = require("./receipts/receipts.module");
const notifications_module_1 = require("./notifications/notifications.module");
const reports_module_1 = require("./reports/reports.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            schedule_1.ScheduleModule.forRoot(),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule, landlords_module_1.LandlordsModule, properties_module_1.PropertiesModule, units_module_1.UnitsModule,
            tenants_module_1.TenantsModule, leases_module_1.LeasesModule, billing_module_1.BillingModule, payments_module_1.PaymentsModule,
            webhooks_module_1.WebhooksModule, receipts_module_1.ReceiptsModule, notifications_module_1.NotificationsModule, reports_module_1.ReportsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map