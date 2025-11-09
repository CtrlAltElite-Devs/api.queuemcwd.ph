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
import { BranchRepository } from "src/repositories/branch.repository";
import { AbilityFactory, Action } from "../ability/ability.factory";
import { EnrichedRequest } from "../common/enriched.request";

@Injectable()
export class BranchGuard implements CanActivate {
    constructor(
        private readonly branchRepository: BranchRepository,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<EnrichedRequest>();
        const branchId = request.params?.branchId;
        const admin = request.admin;

        if (!admin) {
            throw new UnauthorizedException();
        }

        if (!branchId) {
            throw new BadRequestException("branchId param is missing");
        }

        if (!isUUID(branchId)) {
            throw new BadRequestException("branchId must be a valid UUID");
        }

        // todo add caching for this
        const branch = await this.branchRepository.findOne(
            {
                id: branchId,
            },
            { populate: ["admins"] },
        );

        if (branch === null) throw new NotFoundException("Branch not found");
        const adminAbility = this.abilityFactory.defineAbilityForAdmin(admin);
        ForbiddenError.from(adminAbility).throwUnlessCan(Action.Manage, branch);
        request.branch = branch;
        return true;
    }
}
