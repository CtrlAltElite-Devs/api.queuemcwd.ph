import { ForbiddenError } from "@casl/ability";
import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { isUUID } from "class-validator";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AbilityFactory, Action } from "../ability/ability.factory";
import { EnrichedRequest } from "../common/enriched.request";

@Injectable()
export class SlotGuard implements CanActivate {
    constructor(
        private readonly slotRepository: SlotsRepository,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<EnrichedRequest>();
        const slotId = request.params?.slotId;
        const admin = request.admin;

        if (!admin) throw new UnauthorizedException();

        if (!slotId) {
            throw new BadRequestException("slotId param is missing");
        }

        if (!isUUID(slotId)) {
            throw new BadRequestException("slotId must be a valid UUID");
        }

        // todo caching|
        const slot = await this.slotRepository.findOne(
            {
                id: slotId,
            },
            { populate: ["branch"] },
        );

        if (slot === null) throw new NotFoundException("slot not found");

        const abilityForAdmin = this.abilityFactory.defineAbilityForAdmin(admin);
        ForbiddenError.from(abilityForAdmin).throwUnlessCan(Action.Manage, slot.branch);
        request.slot = slot;
        return true;
    }
}
