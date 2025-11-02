import { CanActivate, ExecutionContext, Injectable, Logger } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AdminRole } from "src/entities/admin.entity";
import { AuthenticatedRequest } from "../common/authenticated.request";
import { ROLES_KEY } from "../decorators/admin-roles.decorators";

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const { admin } = request;

        if (!requiredRoles) {
            this.logger.debug(
                `No roles required for ${context.getHandler().name} — allowing access.`,
            );
            return true;
        }

        if (!admin) {
            this.logger.warn(
                `Unauthorized request to ${context.getHandler().name} — no admin found on request.`,
            );
            return false;
        }

        this.logger.debug(
            `Checking roles for admin ${admin.id} (role: ${admin.role}) against required roles: ${requiredRoles.join(", ")}`,
        );

        const hasRole = requiredRoles.some((role) => admin.role.includes(role));

        if (hasRole) {
            this.logger.log(`Access granted for admin ${admin.id} to ${context.getHandler().name}`);
        } else {
            this.logger.warn(
                `Access denied for admin ${admin.id} (role: ${admin.role}) — required roles: ${requiredRoles.join(", ")}`,
            );
        }

        return hasRole;
    }
}
