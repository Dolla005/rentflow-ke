export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RegisterDto {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
