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
import { READONLY_METHODS } from "src/configurations/constants.config";
import { SlotKey, SlotTTL } from "src/constants/cache.constants";
import { Slot } from "src/entities/slot.entity";
import { CacheService } from "src/modules/common/cache-service";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AbilityFactory, Action } from "../ability/ability.factory";
import { EnrichedRequest } from "../common/enriched.request";

@Injectable()
export class SlotGuard implements CanActivate {
    constructor(
        private readonly cacheService: CacheService,
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

        const method = request.method.toUpperCase();
        const isReadonly = READONLY_METHODS.includes(method);

        let slot: Slot | null;

        if (isReadonly) {
            slot = await this.cacheService.GetOrCreateWithLock(SlotKey(slotId), {
                getFunc: () => this.LoadFromDB(slotId),
                ttl: SlotTTL,
            });
        } else {
            slot = await this.LoadFromDB(slotId);
        }

        if (slot === null) throw new NotFoundException("slot not found");

        const abilityForAdmin = this.abilityFactory.defineAbilityForAdmin(admin);
        ForbiddenError.from(abilityForAdmin).throwUnlessCan(Action.Manage, slot.branch);
        request.slot = slot;
        return true;
    }

    private async LoadFromDB(slotId: string) {
        return await this.slotRepository.findOne(
            {
                id: slotId,
            },
            { populate: ["branch"] },
        );
    }
}
