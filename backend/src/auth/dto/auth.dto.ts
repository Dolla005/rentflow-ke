import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'james.kamau@gmail.com' }) @IsEmail() email: string;
  @ApiProperty() @IsString() password: string;
}
export class RegisterDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
}
export class RefreshTokenDto {
  @ApiProperty() @IsString() refreshToken: string;
}
export class ChangePasswordDto {
  @ApiProperty() @IsString() currentPassword: string;
  @ApiProperty() @IsString() @MinLength(8) newPassword: string;
}
