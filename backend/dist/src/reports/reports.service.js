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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async collectionSummary(landlordId, month) {
        const date = month ? new Date(month) : new Date();
        const billingPeriod = new Date(date.getFullYear(), date.getMonth(), 1);
        const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const [charges, payments, lateFees, byStatus] = await Promise.all([
            this.prisma.rentCharge.aggregate({ where: { landlordId, billingPeriod }, _sum: { amountDue: true, amountPaid: true, balance: true }, _count: true }),
            this.prisma.payment.aggregate({ where: { landlordId, isReversed: false, paidAt: { gte: billingPeriod, lt: nextMonth } }, _sum: { amount: true }, _count: true }),
            this.prisma.lateFeeCharge.aggregate({ where: { rentCharge: { landlordId, billingPeriod }, isWaived: false }, _sum: { amount: true } }),
            this.prisma.rentCharge.groupBy({ by: ['status'], where: { landlordId, billingPeriod }, _count: true, _sum: { amountDue: true } }),
        ]);
        const expected = Number(charges._sum.amountDue ?? 0);
        const collected = Number(charges._sum.amountPaid ?? 0);
        return { period: billingPeriod, totalExpected: expected, totalCollected: collected, totalOutstanding: Number(charges._sum.balance ?? 0), totalLateFees: Number(lateFees._sum.amount ?? 0), paymentCount: payments._count, collectionRate: expected ? Math.round((collected / expected) * 100) : 0, byStatus };
    }
    async arrearsReport(landlordId) {
        const now = new Date();
        const overdue = await this.prisma.rentCharge.findMany({ where: { landlordId, status: { in: ['UNPAID', 'PARTIAL', 'OVERDUE'] }, dueDate: { lt: now } }, include: { tenant: true, lease: { include: { unit: { include: { property: true } } } }, lateFees: { where: { isWaived: false } } }, orderBy: { dueDate: 'asc' } });
        return overdue.map(c => ({ tenant: c.tenant.firstName + ' ' + c.tenant.lastName, tenantPhone: c.tenant.phone, property: c.lease.unit.property.name, unit: c.lease.unit.unitNumber, billingPeriod: c.billingPeriod, dueDate: c.dueDate, amountDue: Number(c.amountDue), amountPaid: Number(c.amountPaid), balance: Number(c.balance), lateFees: c.lateFees.reduce((s, f) => s + Number(f.amount), 0), daysOverdue: Math.floor((now.getTime() - c.dueDate.getTime()) / 86400000) }));
    }
    async propertyPerformance(landlordId) {
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const properties = await this.prisma.property.findMany({ where: { landlordId }, include: { units: { include: { leases: { where: { status: 'ACTIVE' }, include: { rentCharges: { where: { billingPeriod: startOfMonth } } } } } } } });
        return properties.map(p => {
            const totalUnits = p.units.length;
            const occupiedUnits = p.units.filter(u => u.status === 'OCCUPIED').length;
            const allCharges = p.units.flatMap(u => u.leases).flatMap(l => l.rentCharges);
            const expected = allCharges.reduce((s, c) => s + Number(c.amountDue), 0);
            const collected = allCharges.reduce((s, c) => s + Number(c.amountPaid), 0);
            return { property: p.name, county: p.county, totalUnits, occupiedUnits, vacantUnits: totalUnits - occupiedUnits, occupancyRate: totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0, expectedRent: expected, collectedRent: collected, collectionRate: expected ? Math.round((collected / expected) * 100) : 0 };
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map