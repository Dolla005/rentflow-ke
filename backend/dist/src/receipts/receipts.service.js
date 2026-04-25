"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReceiptsService = class ReceiptsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(landlordId, tenantId) {
        return this.prisma.receipt.findMany({ where: { landlordId, ...(tenantId && { tenantId }) }, include: { tenant: true, payment: true, landlord: { select: { businessName: true, branding: true } } }, orderBy: { issuedAt: 'desc' } });
    }
    async findOne(id, landlordId) {
        const r = await this.prisma.receipt.findFirst({ where: { id, landlordId }, include: { tenant: true, payment: { include: { allocations: { include: { rentCharge: true } } } }, landlord: true } });
        if (!r)
            throw new common_1.NotFoundException('Receipt not found');
        return r;
    }
};
exports.ReceiptsService = ReceiptsService;
exports.ReceiptsService = ReceiptsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReceiptsService);
//# sourceMappingURL=receipts.service.js.map