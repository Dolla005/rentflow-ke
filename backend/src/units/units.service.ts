import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(landlordId: string, propertyId?: string) {
    return this.prisma.unit.findMany({ where: { property: { landlordId }, ...(propertyId && { propertyId }) }, include: { property: { select: { id: true, name: true, code: true } }, leases: { where: { status: 'ACTIVE' }, include: { tenant: { select: { id: true, firstName: true, lastName: true, phone: true } } } } }, orderBy: [{ property: { name: 'asc' } }, { unitNumber: 'asc' }] });
  }
  async findOne(id: string, landlordId: string) {
    const u = await this.prisma.unit.findFirst({ where: { id, property: { landlordId } }, include: { property: true, leases: { include: { tenant: true }, orderBy: { createdAt: 'desc' } } } });
    if (!u) throw new NotFoundException('Unit not found');
    return u;
  }
  async create(landlordId: string, dto: any) {
    const property = await this.prisma.property.findFirst({ where: { id: dto.propertyId, landlordId } });
    if (!property) throw new NotFoundException('Property not found');
    return this.prisma.unit.create({ data: { ...dto, unitNumber: dto.unitNumber.toUpperCase() } });
  }
  async update(id: string, landlordId: string, dto: any) {
    await this.findOne(id, landlordId);
    return this.prisma.unit.update({ where: { id }, data: dto });
  }
  async getAvailable(landlordId: string) {
    return this.prisma.unit.findMany({ where: { property: { landlordId }, status: 'VACANT' }, include: { property: { select: { id: true, name: true } } } });
  }
}
