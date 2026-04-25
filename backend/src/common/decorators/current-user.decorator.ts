import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export interface RequestUser { id: string; email: string; firstName: string; lastName: string; role: string; landlordId: string; isActive: boolean; }
export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): RequestUser => ctx.switchToHttp().getRequest().user);
