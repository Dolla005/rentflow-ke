import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(landlordId: string) {
    return this.prisma.property.findMany({ where: { landlordId }, include: { units: { select: { id: true, unitNumber: true, rentAmount: true, status: true } }, _count: { select: { units: true } } }, orderBy: { createdAt: 'desc' } });
  }
  async findOne(id: string, landlordId: string) {
    const p = await this.prisma.property.findFirst({ where: { id, landlordId }, include: { units: { include: { leases: { where: { status: 'ACTIVE' }, include: { tenant: true } } } } } });
    if (!p) throw new NotFoundException('Property not found');
    return p;
  }
  async create(landlordId: string, dto: any) {
    return this.prisma.property.create({ data: { ...dto, landlordId, code: dto.code.toUpperCase() } });
  }
  async update(id: string, landlordId: string, dto: any) {
    await this.findOne(id, landlordId);
    return this.prisma.property.update({ where: { id }, data: dto });
  }
  async remove(id: string, landlordId: string) {
    await this.findOne(id, landlordId);
    await this.prisma.property.update({ where: { id }, data: { isActive: false } });
    return { message: 'Property deactivated' };
  }
}
