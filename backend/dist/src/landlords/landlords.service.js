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
exports.LandlordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const client_1 = require("@prisma/client");
const { Decimal } = require('@prisma/client/runtime/library');
let LandlordsService = class LandlordsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.landlord.findMany({ include: { _count: { select: { properties: true, tenants: true, leases: true } } }, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id) {
        const l = await this.prisma.landlord.findUnique({ where: { id }, include: { properties: { include: { _count: { select: { units: true } } } }, _count: { select: { tenants: true, leases: true } } } });
        if (!l)
            throw new common_1.NotFoundException('Landlord not found');
        return l;
    }
    async create(dto) {
        if (await this.prisma.landlord.findUnique({ where: { email: dto.email } }))
            throw new common_1.ConflictException('Email in use');
        if (await this.prisma.landlord.findUnique({ where: { accountPrefix: dto.accountPrefix.toUpperCase() } }))
            throw new common_1.ConflictException('Prefix in use');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        return this.prisma.$transaction(async (tx) => {
            const landlord = await tx.landlord.create({ data: { name: dto.name, businessName: dto.businessName, email: dto.email.toLowerCase(), phone: dto.phone, paybillNumber: dto.paybillNumber, accountPrefix: dto.accountPrefix.toUpperCase(), branding: dto.branding } });
            await tx.user.create({ data: { email: dto.email.toLowerCase(), phone: dto.phone, passwordHash, firstName: dto.name.split(' ')[0] || dto.name, lastName: dto.name.split(' ').slice(1).join(' ') || '', role: client_1.UserRole.LANDLORD, landlordId: landlord.id } });
            return landlord;
        });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.landlord.update({ where: { id }, data: dto });
    }
    async getDashboard(landlordId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalProperties, unitStats, expectedRent, collectedRent, overdueCharges, recentPayments, unpaidTenants] = await Promise.all([
            this.prisma.property.count({ where: { landlordId, isActive: true } }),
            this.prisma.unit.groupBy({ by: ['status'], where: { property: { landlordId } }, _count: true }),
            this.prisma.rentCharge.aggregate({ where: { landlordId, billingPeriod: startOfMonth }, _sum: { amountDue: true } }),
            this.prisma.rentCharge.aggregate({ where: { landlordId, billingPeriod: startOfMonth }, _sum: { amountPaid: true } }),
            this.prisma.rentCharge.findMany({ where: { landlordId, status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] }, dueDate: { lt: now } }, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } } }, orderBy: { dueDate: 'asc' }, take: 10 }),
            this.prisma.payment.findMany({ where: { landlordId, isReversed: false }, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } } }, orderBy: { paidAt: 'desc' }, take: 10 }),
            this.prisma.rentCharge.findMany({ where: { landlordId, billingPeriod: startOfMonth, status: { in: ['UNPAID', 'PARTIAL'] } }, include: { tenant: true, lease: { include: { unit: true } } }, take: 20 }),
        ]);
        const occupied = unitStats.find(s => s.status === 'OCCUPIED')?._count ?? 0;
        const vacant = unitStats.find(s => s.status === 'VACANT')?._count ?? 0;
        const totalUnits = unitStats.reduce((a, b) => a + b._count, 0);
        const expected = Number(expectedRent._sum.amountDue ?? 0);
        const collected = Number(collectedRent._sum.amountPaid ?? 0);
        return { properties: totalProperties, units: { total: totalUnits, occupied, vacant }, rent: { expected, collected, outstanding: expected - collected, collectionRate: expected ? Math.round((collected / expected) * 100) : 0 }, overdueCharges, recentPayments, unpaidTenants };
    }
    async getUsers(landlordId) {
        return this.prisma.user.findMany({ where: { landlordId }, select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true, lastLoginAt: true, createdAt: true } });
    }
};
exports.LandlordsService = LandlordsService;
exports.LandlordsService = LandlordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LandlordsService);
//# sourceMappingURL=landlords.service.js.map