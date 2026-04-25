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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuthService = class AuthService {
    constructor(prisma, jwt, config) {
        this.prisma = prisma;
        this.jwt = jwt;
        this.config = config;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() }, include: { landlord: true } });
        if (!user || !user.isActive)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!await bcrypt.compare(dto.password, user.passwordHash))
            throw new common_1.UnauthorizedException('Invalid credentials');
        await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        const tokens = await this.generateTokens(user.id, user.email, user.role, user.landlordId);
        return { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, landlordId: user.landlordId, landlord: user.landlord }, ...tokens };
    }
    async register(dto) {
        if (await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } }))
            throw new common_1.ConflictException('Email already in use');
        const passwordHash = await bcrypt.hash(dto.password, 12);
        const user = await this.prisma.user.create({ data: { email: dto.email.toLowerCase(), phone: dto.phone, passwordHash, firstName: dto.firstName, lastName: dto.lastName, role: client_1.UserRole.TENANT } });
        return { user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role }, ...await this.generateTokens(user.id, user.email, user.role, null) };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwt.verify(refreshToken, { secret: this.config.get('JWT_REFRESH_SECRET') });
            const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
            if (!user || !user.isActive)
                throw new common_1.UnauthorizedException();
            return this.generateTokens(user.id, user.email, user.role, user.landlordId);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, phone: true, firstName: true, lastName: true, role: true, landlordId: true, lastLoginAt: true, createdAt: true, landlord: { select: { id: true, name: true, businessName: true, paybillNumber: true, accountPrefix: true, branding: true } } } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!await bcrypt.compare(dto.currentPassword, user.passwordHash))
            throw new common_1.BadRequestException('Current password incorrect');
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) } });
        return { message: 'Password changed successfully' };
    }
    async generateTokens(userId, email, role, landlordId) {
        const payload = { sub: userId, email, role, landlordId };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, { secret: this.config.get('JWT_SECRET'), expiresIn: this.config.get('JWT_EXPIRES_IN', '7d') }),
            this.jwt.signAsync(payload, { secret: this.config.get('JWT_REFRESH_SECRET'), expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d') }),
        ]);
        return { accessToken, refreshToken };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, jwt_1.JwtService, config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map