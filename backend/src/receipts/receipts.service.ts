import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(landlordId: string, tenantId?: string) {
    return this.prisma.receipt.findMany({ where: { landlordId, ...(tenantId && { tenantId }) }, include: { tenant: true, payment: true, landlord: { select: { businessName: true, branding: true } } }, orderBy: { issuedAt: 'desc' } });
  }
  async findOne(id: string, landlordId: string) {
    const r = await this.prisma.receipt.findFirst({ where: { id, landlordId }, include: { tenant: true, payment: { include: { allocations: { include: { rentCharge: true } } } }, landlord: true } });
    if (!r) throw new NotFoundException('Receipt not found');
    return r;
  }
}
