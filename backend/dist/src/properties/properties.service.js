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
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PropertiesService = class PropertiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(landlordId) {
        return this.prisma.property.findMany({ where: { landlordId }, include: { units: { select: { id: true, unitNumber: true, rentAmount: true, status: true } }, _count: { select: { units: true } } }, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id, landlordId) {
        const p = await this.prisma.property.findFirst({ where: { id, landlordId }, include: { units: { include: { leases: { where: { status: 'ACTIVE' }, include: { tenant: true } } } } } });
        if (!p)
            throw new common_1.NotFoundException('Property not found');
        return p;
    }
    async create(landlordId, dto) {
        return this.prisma.property.create({ data: { ...dto, landlordId, code: dto.code.toUpperCase() } });
    }
    async update(id, landlordId, dto) {
        await this.findOne(id, landlordId);
        return this.prisma.property.update({ where: { id }, data: dto });
    }
    async remove(id, landlordId) {
        await this.findOne(id, landlordId);
        await this.prisma.property.update({ where: { id }, data: { isActive: false } });
        return { message: 'Property deactivated' };
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map