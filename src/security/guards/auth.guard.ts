import {
    CanActivate,
    ExecutionContext,
    Injectable,
    Logger,
    UnauthorizedException,
} from "@nestjs/common";
import { AdminService } from "src/modules/admin/admin.service";
import { CustomJwtService } from "src/modules/common/custom-jwt-service";
import { AuthenticatedRequest } from "../common/authenticated.request";

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly logger = new Logger(AuthGuard.name);

    constructor(
        private readonly jwtService: CustomJwtService,
        private readonly adminService: AdminService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const { method, url } = request;
        const authorization = request.headers.authorization;

        let token: string | undefined;

        this.logger.log(`Incoming request: [${method}] ${url}`);

        if (authorization?.startsWith("Bearer ")) {
            token = authorization.split(" ")[1];
            this.logger.debug(`Bearer token provided: ${token.substring(0, 15)}...`);
        } else {
            this.logger.debug("No Bearer token provided in headers");
        }

        if (!token) {
            this.logger.warn(`Unauthorized request to [${method}] ${url} - no token provided`);
            throw new UnauthorizedException("Authentication token missing");
        }

        try {
            const decodedPayload = await this.jwtService.VerifyAndDecodeAccessToken(token);
            this.logger.debug(`Decoded token payload: ${JSON.stringify(decodedPayload)}`);
            const admin = await this.adminService.GetAdminByIdForGuard(decodedPayload.adminId);

            if (!admin) {
                this.logger.warn(`Invalid admin token: adminId=${decodedPayload.adminId}`);
                throw new UnauthorizedException("Invalid token");
            }

            this.logger.log(`Authenticated admin (id=${admin.id}, email=${admin.email})`);
            request.admin = admin;

            this.logger.log(`Access granted to [${method}] ${url}`);
            return true;
        } catch (err) {
            this.logger.error(`Authentication failed for [${method}] ${url}: ${err}`);
        }
        throw new UnauthorizedException("Malformed or Expired Access Token");
    }
}
