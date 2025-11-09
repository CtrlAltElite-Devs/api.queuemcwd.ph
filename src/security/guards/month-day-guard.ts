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
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { AbilityFactory, Action } from "../ability/ability.factory";
import { EnrichedRequest } from "../common/enriched.request";

@Injectable()
export class MonthDayGuard implements CanActivate {
    constructor(
        private readonly monthDayRepository: MonthDayRepository,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<EnrichedRequest>();
        const monthDayId = request.params?.monthDayId;
        const admin = request.admin;

        if (!admin) throw new UnauthorizedException();

        if (!monthDayId) {
            throw new BadRequestException("monthDayId param is missing");
        }

        if (!isUUID(monthDayId)) {
            throw new BadRequestException("monthDayId must be a valid UUID");
        }

        // todo use caching
        const monthDay = await this.monthDayRepository.findOne(
            {
                id: monthDayId,
            },
            { populate: ["branch"] },
        );

        if (monthDay === null) throw new NotFoundException("monthday not found");
        const abilityForAdmin = this.abilityFactory.defineAbilityForAdmin(admin);
        ForbiddenError.from(abilityForAdmin).throwUnlessCan(Action.Manage, monthDay.branch);
        request.monthDay = monthDay;
        return true;
    }
}
