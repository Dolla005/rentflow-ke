import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, RequestUser } from '../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}
  @Post('login') @HttpCode(200) login(@Body() dto: LoginDto) { return this.svc.login(dto); }
  @Post('register') register(@Body() dto: RegisterDto) { return this.svc.register(dto); }
  @Post('refresh') @HttpCode(200) refresh(@Body() dto: RefreshTokenDto) { return this.svc.refreshToken(dto.refreshToken); }
  @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth() getProfile(@CurrentUser() u: RequestUser) { return this.svc.getProfile(u.id); }
  @Post('change-password') @UseGuards(JwtAuthGuard) @ApiBearerAuth() @HttpCode(200) changePassword(@CurrentUser() u: RequestUser, @Body() dto: ChangePasswordDto) { return this.svc.changePassword(u.id, dto); }
}
