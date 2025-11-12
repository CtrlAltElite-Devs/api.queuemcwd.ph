import { createParamDecorator } from "@nestjs/common";
import { AuthenticatedRequest } from "src/security/common/authenticated.request";

export const CurrentAdmin = createParamDecorator((_, ctx) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.admin;
});
