import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private config: ConfigService, private prisma: PrismaService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), ignoreExpiration: false, secretOrKey: config.get('JWT_SECRET') });
  }
  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true, email: true, firstName: true, lastName: true, role: true, landlordId: true, isActive: true, landlord: { select: { id: true, businessName: true, accountPrefix: true, paybillNumber: true, branding: true } } } });
    if (!user || !user.isActive) throw new UnauthorizedException('User inactive or not found');
    return user;
  }
}
