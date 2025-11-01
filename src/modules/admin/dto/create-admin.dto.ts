import { IsEmail, IsEnum, IsOptional, IsStrongPassword } from "class-validator";
import { AdminRole } from "src/entities/admin.entity";

export class CreateAdminDto {
    @IsEmail()
    email: string;

    @IsOptional()
    @IsStrongPassword()
    password?: string;

    @IsEnum(AdminRole)
    role: AdminRole;
}
