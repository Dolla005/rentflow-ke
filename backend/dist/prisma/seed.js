"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { Decimal } = require('@prisma/client/runtime/library');
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding RentFlow KE...');
    const superAdminHash = await bcrypt.hash('SuperAdmin@2024!', 12);
    await prisma.user.upsert({
        where: { email: 'admin@rentflow.ke' },
        update: {},
        create: { email: 'admin@rentflow.ke', phone: '+254700000001', passwordHash: superAdminHash, firstName: 'System', lastName: 'Admin', role: client_1.UserRole.SUPER_ADMIN },
    });
    const landlordHash = await bcrypt.hash('Landlord@2024!', 12);
    const landlordUser = await prisma.user.upsert({
        where: { email: 'james.kamau@gmail.com' },
        update: {},
        create: { email: 'james.kamau@gmail.com', phone: '+254711222333', passwordHash: landlordHash, firstName: 'James', lastName: 'Kamau', role: client_1.UserRole.LANDLORD },
    });
    const landlord = await prisma.landlord.upsert({
        where: { email: 'james.kamau@gmail.com' },
        update: {},
        create: { name: 'James Kamau', businessName: 'Kamau Properties Ltd', email: 'james.kamau@gmail.com', phone: '+254711222333', paybillNumber: '4087321', accountPrefix: 'KAM', branding: { primaryColor: '#2563eb', address: 'P.O. Box 12345-00100, Nairobi' } },
    });
    await prisma.user.update({ where: { id: landlordUser.id }, data: { landlordId: landlord.id } });
    const managerHash = await bcrypt.hash('Manager@2024!', 12);
    await prisma.user.upsert({
        where: { email: 'peter.odhiambo@kamauprops.ke' },
        update: {},
        create: { email: 'peter.odhiambo@kamauprops.ke', phone: '+254722333444', passwordHash: managerHash, firstName: 'Peter', lastName: 'Odhiambo', role: client_1.UserRole.MANAGER, landlordId: landlord.id },
    });
    const propA = await prisma.property.upsert({
        where: { landlordId_code: { landlordId: landlord.id, code: 'KILELESHWA' } },
        update: {},
        create: { landlordId: landlord.id, name: 'Kileleshwa Heights', code: 'KILELESHWA', address: 'Kileleshwa Road, Westlands', county: 'Nairobi', propertyType: client_1.PropertyType.APARTMENT_BLOCK },
    });
    const propB = await prisma.property.upsert({
        where: { landlordId_code: { landlordId: landlord.id, code: 'RONGAI' } },
        update: {},
        create: { landlordId: landlord.id, name: 'Rongai Gardens', code: 'RONGAI', address: 'Rongai Town, Kajiado', county: 'Kajiado', propertyType: client_1.PropertyType.BUNGALOW },
    });
    const unitData = [
        { propertyId: propA.id, unitNumber: 'A1', floor: '1st', rentAmount: 25000, status: client_1.UnitStatus.OCCUPIED },
        { propertyId: propA.id, unitNumber: 'A2', floor: '1st', rentAmount: 25000, status: client_1.UnitStatus.OCCUPIED },
        { propertyId: propA.id, unitNumber: 'B1', floor: '2nd', rentAmount: 28000, status: client_1.UnitStatus.OCCUPIED },
        { propertyId: propA.id, unitNumber: 'B2', floor: '2nd', rentAmount: 28000, status: client_1.UnitStatus.VACANT },
        { propertyId: propB.id, unitNumber: 'H1', floor: 'Ground', rentAmount: 15000, status: client_1.UnitStatus.OCCUPIED },
        { propertyId: propB.id, unitNumber: 'H2', floor: 'Ground', rentAmount: 15000, status: client_1.UnitStatus.OCCUPIED },
    ];
    const units = [];
    for (const u of unitData) {
        const unit = await prisma.unit.upsert({
            where: { propertyId_unitNumber: { propertyId: u.propertyId, unitNumber: u.unitNumber } },
            update: {},
            create: { ...u, rentAmount: new Decimal(u.rentAmount) },
        });
        units.push(unit);
    }
    const tenantData = [
        { firstName: 'Grace', lastName: 'Wanjiku', phone: '+254733111222', email: 'grace.wanjiku@gmail.com', nationalId: '29876543' },
        { firstName: 'Brian', lastName: 'Otieno', phone: '+254744222333', email: 'brian.otieno@gmail.com', nationalId: '34512678' },
        { firstName: 'Amina', lastName: 'Hassan', phone: '+254755333444', email: 'amina.hassan@gmail.com', nationalId: '27654321' },
        { firstName: 'David', lastName: 'Mwangi', phone: '+254766444555', email: 'david.mwangi@gmail.com', nationalId: '31234567' },
        { firstName: 'Fatuma', lastName: 'Ali', phone: '+254777555666', email: 'fatuma.ali@gmail.com', nationalId: '28765432' },
    ];
    const tenants = [];
    for (const td of tenantData) {
        const hash = await bcrypt.hash('Tenant@2024!', 12);
        const user = await prisma.user.upsert({
            where: { email: td.email },
            update: {},
            create: { email: td.email, phone: td.phone, passwordHash: hash, firstName: td.firstName, lastName: td.lastName, role: client_1.UserRole.TENANT, landlordId: landlord.id },
        });
        const tenant = await prisma.tenant.upsert({
            where: { userId: user.id },
            update: {},
            create: { landlordId: landlord.id, userId: user.id, firstName: td.firstName, lastName: td.lastName, phone: td.phone, email: td.email, nationalId: td.nationalId, emergencyContactName: 'Emergency Contact', emergencyContactPhone: '+254700999888' },
        });
        tenants.push(tenant);
    }
    await prisma.lateFeeRule.upsert({
        where: { id: 'default-late-fee' },
        update: {},
        create: { id: 'default-late-fee', landlordId: landlord.id, name: 'Standard Late Fee', gracePeriodDays: 5, feeType: client_1.LateFeeType.FIXED, feeValue: new Decimal(500), isRecurring: false, isActive: true },
    });
    const leaseConfigs = [
        { tenant: tenants[0], unit: units[0], rent: 25000, ref: 'KAM-KILELESHWA-A1' },
        { tenant: tenants[1], unit: units[1], rent: 25000, ref: 'KAM-KILELESHWA-A2' },
        { tenant: tenants[2], unit: units[2], rent: 28000, ref: 'KAM-KILELESHWA-B1' },
        { tenant: tenants[3], unit: units[4], rent: 15000, ref: 'KAM-RONGAI-H1' },
        { tenant: tenants[4], unit: units[5], rent: 15000, ref: 'KAM-RONGAI-H2' },
    ];
    const now = new Date();
    for (const lc of leaseConfigs) {
        const lease = await prisma.lease.upsert({
            where: { accountReference: lc.ref },
            update: {},
            create: { landlordId: landlord.id, tenantId: lc.tenant.id, unitId: lc.unit.id, accountReference: lc.ref, monthlyRent: new Decimal(lc.rent), depositAmount: new Decimal(lc.rent), depositPaid: true, paymentDueDay: 1, startDate: new Date('2024-01-01'), status: client_1.LeaseStatus.ACTIVE },
        });
        for (let i = 2; i >= 0; i--) {
            const billingPeriod = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const dueDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const existing = await prisma.rentCharge.findUnique({ where: { leaseId_billingPeriod: { leaseId: lease.id, billingPeriod } } });
            if (!existing) {
                await prisma.rentCharge.create({
                    data: { leaseId: lease.id, tenantId: lc.tenant.id, landlordId: landlord.id, amountDue: new Decimal(lc.rent), amountPaid: new Decimal(0), balance: new Decimal(lc.rent), billingPeriod, dueDate, status: client_1.ChargeStatus.UNPAID },
                });
            }
        }
    }
    const graceLease = await prisma.lease.findUnique({ where: { accountReference: 'KAM-KILELESHWA-A1' } });
    const graceCharges = await prisma.rentCharge.findMany({ where: { leaseId: graceLease.id }, orderBy: { billingPeriod: 'asc' } });
    for (let i = 0; i < graceCharges.length; i++) {
        const charge = graceCharges[i];
        const ref = 'QG' + String(100 + i) + 'GRACE';
        const existing = await prisma.payment.findFirst({ where: { mpesaReference: ref } });
        if (!existing) {
            const payment = await prisma.payment.create({
                data: { landlordId: landlord.id, tenantId: graceLease.tenantId, leaseId: graceLease.id, amount: new Decimal(25000), mpesaReference: ref, accountNumber: 'KAM-KILELESHWA-A1', phoneFrom: '+254733111222', provider: client_1.PaymentProvider.MPESA, matchStatus: client_1.PaymentMatchStatus.MATCHED, paidAt: new Date(charge.billingPeriod.getFullYear(), charge.billingPeriod.getMonth(), 3) },
            });
            await prisma.paymentAllocation.create({ data: { paymentId: payment.id, rentChargeId: charge.id, amountApplied: new Decimal(25000) } });
            await prisma.rentCharge.update({ where: { id: charge.id }, data: { amountPaid: new Decimal(25000), balance: new Decimal(0), status: client_1.ChargeStatus.PAID } });
            await prisma.receipt.create({ data: { landlordId: landlord.id, paymentId: payment.id, tenantId: graceLease.tenantId, receiptNumber: 'RFT-' + Date.now() + '-' + i, amountPaid: new Decimal(25000), balanceAfter: new Decimal(0) } });
        }
    }
    console.log('');
    console.log('🎉 Seed complete!');
    console.log('');
    console.log('Test accounts:');
    console.log('  Super Admin : admin@rentflow.ke           / SuperAdmin@2024!');
    console.log('  Landlord    : james.kamau@gmail.com       / Landlord@2024!');
    console.log('  Manager     : peter.odhiambo@kamauprops.ke / Manager@2024!');
    console.log('  Tenant      : grace.wanjiku@gmail.com     / Tenant@2024!');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map