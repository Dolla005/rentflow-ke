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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const client_1 = require("@prisma/client");
let TenantsService = class TenantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(landlordId) {
        return this.prisma.tenant.findMany({ where: { landlordId }, include: { leases: { where: { status: 'ACTIVE' }, include: { unit: { include: { property: true } } } }, _count: { select: { leases: true, payments: true } } }, orderBy: { createdAt: 'desc' } });
    }
    async findOne(id, landlordId) {
        const t = await this.prisma.tenant.findFirst({ where: { id, landlordId }, include: { leases: { include: { unit: { include: { property: true } } }, orderBy: { createdAt: 'desc' } }, payments: { include: { receipt: true }, orderBy: { paidAt: 'desc' }, take: 20 } } });
        if (!t)
            throw new common_1.NotFoundException('Tenant not found');
        return t;
    }
    async create(landlordId, dto) {
        if (dto.email && await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } }))
            throw new common_1.ConflictException('Email already in use');
        return this.prisma.$transaction(async (tx) => {
            let userId;
            if (dto.email && dto.password) {
                const user = await tx.user.create({ data: { email: dto.email.toLowerCase(), phone: dto.phone, passwordHash: await bcrypt.hash(dto.password, 12), firstName: dto.firstName, lastName: dto.lastName, role: client_1.UserRole.TENANT, landlordId } });
                userId = user.id;
            }
            return tx.tenant.create({ data: { landlordId, userId, firstName: dto.firstName, lastName: dto.lastName, phone: dto.phone, email: dto.email, nationalId: dto.nationalId, emergencyContactName: dto.emergencyContactName, emergencyContactPhone: dto.emergencyContactPhone, notes: dto.notes } });
        });
    }
    async update(id, landlordId, dto) {
        await this.findOne(id, landlordId);
        return this.prisma.tenant.update({ where: { id }, data: dto });
    }
    async getLedger(id, landlordId) {
        const tenant = await this.findOne(id, landlordId);
        const charges = await this.prisma.rentCharge.findMany({ where: { tenantId: id }, include: { allocations: { include: { payment: true } }, lateFees: true, lease: { include: { unit: { include: { property: true } } } } }, orderBy: { billingPeriod: 'desc' } });
        let runningBalance = 0;
        const ledger = [];
        for (const charge of [...charges].reverse()) {
            const lateTotal = charge.lateFees.filter(f => !f.isWaived).reduce((s, f) => s + Number(f.amount), 0);
            runningBalance += Number(charge.amountDue) + lateTotal;
            const period = new Date(charge.billingPeriod).toLocaleString('default', { month: 'long', year: 'numeric' });
            ledger.push({ type: 'CHARGE', date: charge.dueDate, description: 'Rent - ' + period, amount: Number(charge.amountDue), balance: runningBalance });
            if (lateTotal > 0)
                ledger.push({ type: 'LATE_FEE', date: charge.dueDate, description: 'Late payment fee', amount: lateTotal, balance: runningBalance });
            for (const alloc of charge.allocations) {
                runningBalance -= Number(alloc.amountApplied);
                ledger.push({ type: 'PAYMENT', date: alloc.payment.paidAt, description: 'Payment - ' + (alloc.payment.mpesaReference || 'Manual'), amount: -Number(alloc.amountApplied), balance: runningBalance });
            }
        }
        return { tenant, ledger: ledger.reverse(), currentBalance: runningBalance };
    }
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map