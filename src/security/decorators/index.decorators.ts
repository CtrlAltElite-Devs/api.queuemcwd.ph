import { applyDecorators, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ACCESS_TOKEN } from "src/configurations/constants.config";
import { AdminRole } from "src/entities/admin.entity";
import { RolesGuard } from "../guards/admin-roles.guard";
import { AuthGuard } from "../guards/auth.guard";
import { Roles } from "./admin-roles.decorators";

export function UseAuthenticationGuard() {
    return applyDecorators(UseGuards(AuthGuard), ApiBearerAuth(ACCESS_TOKEN));
}

export function UseSuperAdminOnlyGuard() {
    return applyDecorators(
        UseAuthenticationGuard(),
        UseGuards(RolesGuard),
        Roles(AdminRole.SUPER_ADMIN),
    );
}

export function UseAdminOnlyGuard() {
    return applyDecorators(
        UseAuthenticationGuard(),
        UseGuards(RolesGuard),
        Roles(AdminRole.BRANCH_ADMIN, AdminRole.SUPER_ADMIN),
    );
}
