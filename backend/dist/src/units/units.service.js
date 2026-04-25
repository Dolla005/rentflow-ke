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
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UnitsService = class UnitsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(landlordId, propertyId) {
        return this.prisma.unit.findMany({ where: { property: { landlordId }, ...(propertyId && { propertyId }) }, include: { property: { select: { id: true, name: true, code: true } }, leases: { where: { status: 'ACTIVE' }, include: { tenant: { select: { id: true, firstName: true, lastName: true, phone: true } } } } }, orderBy: [{ property: { name: 'asc' } }, { unitNumber: 'asc' }] });
    }
    async findOne(id, landlordId) {
        const u = await this.prisma.unit.findFirst({ where: { id, property: { landlordId } }, include: { property: true, leases: { include: { tenant: true }, orderBy: { createdAt: 'desc' } } } });
        if (!u)
            throw new common_1.NotFoundException('Unit not found');
        return u;
    }
    async create(landlordId, dto) {
        const property = await this.prisma.property.findFirst({ where: { id: dto.propertyId, landlordId } });
        if (!property)
            throw new common_1.NotFoundException('Property not found');
        return this.prisma.unit.create({ data: { ...dto, unitNumber: dto.unitNumber.toUpperCase() } });
    }
    async update(id, landlordId, dto) {
        await this.findOne(id, landlordId);
        return this.prisma.unit.update({ where: { id }, data: dto });
    }
    async getAvailable(landlordId) {
        return this.prisma.unit.findMany({ where: { property: { landlordId }, status: 'VACANT' }, include: { property: { select: { id: true, name: true } } } });
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UnitsService);
//# sourceMappingURL=units.service.js.map