import { IsEmail, IsEnum, IsOptional, IsStrongPassword, IsUUID } from "class-validator";
import { AdminRole } from "src/entities/admin.entity";

export class CreateAdminDto {
    @IsEmail()
    email: string;

    @IsOptional()
    @IsStrongPassword()
    password?: string;

    @IsEnum(AdminRole)
    role: AdminRole;

    @IsOptional()
    @IsUUID()
    branchId?: string;
}
