import { createParamDecorator } from "@nestjs/common";
import { EnrichedRequest } from "src/security/common/enriched.request";

export const SlotEntity = createParamDecorator((_, ctx) => {
    const request = ctx.switchToHttp().getRequest<EnrichedRequest>();
    return request.slot;
});
