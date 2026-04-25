export interface RequestUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    landlordId: string;
    isActive: boolean;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
