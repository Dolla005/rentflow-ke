import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ChangePasswordDto } from './dto/auth.dto';
import { RequestUser } from '../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly svc;
    constructor(svc: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
            landlordId: any;
            landlord: any;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: any;
            email: any;
            firstName: any;
            lastName: any;
            role: any;
        };
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(u: RequestUser): Promise<any>;
    changePassword(u: RequestUser, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
