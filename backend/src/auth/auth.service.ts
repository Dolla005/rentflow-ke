import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService, private config: ConfigService) {}

  async login(dto: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() }, include: { landlord: true } });
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');
    if (!await bcrypt.compare(dto.password, user.passwordHash)) throw new UnauthorizedException('Invalid credentials');
    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const tokens = await this.generateTokens(user.id, user.email, user.role, user.landlordId);
    return { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, landlordId: user.landlordId, landlord: user.landlord }, ...tokens };
  }

  async register(dto: any) {
    if (await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })) throw new ConflictException('Email already in use');
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({ data: { email: dto.email.toLowerCase(), phone: dto.phone, passwordHash, firstName: dto.firstName, lastName: dto.lastName, role: UserRole.TENANT } });
    return { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, ...await this.generateTokens(user.id, user.email, user.role, null) };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwt.verify(refreshToken, { secret: this.config.get('JWT_REFRESH_SECRET') });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.isActive) throw new UnauthorizedException();
      return this.generateTokens(user.id, user.email, user.role, user.landlordId);
    } catch { throw new UnauthorizedException('Invalid refresh token'); }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, landlordId: true, lastLoginAt: true, createdAt: true, landlord: { select: { id: true, name: true, businessName: true, paybillNumber: true, accountPrefix: true, branding: true } } } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async changePassword(userId: string, dto: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (!await bcrypt.compare(dto.currentPassword, user.passwordHash)) throw new BadRequestException('Current password incorrect');
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) } });
    return { message: 'Password changed successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string, landlordId: string | null) {
    const payload = { sub: userId, email, role, landlordId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN', '7d') }),
      this.jwt.signAsync(payload, { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d') }),
    ]);
    return { accessToken, refreshToken };
  }
}
