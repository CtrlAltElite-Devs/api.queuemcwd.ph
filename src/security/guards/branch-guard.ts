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
import { BranchCacheTTL, BranchKey } from "src/constants/cache.constants";
import { Branch } from "src/entities/branch.entity";
import { CacheService } from "src/modules/common/cache-service";
import { BranchRepository } from "src/repositories/branch.repository";
import { AbilityFactory, Action } from "../ability/ability.factory";
import { EnrichedRequest } from "../common/enriched.request";

@Injectable()
export class BranchGuard implements CanActivate {
    constructor(
        private readonly cacheService: CacheService,
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

        const method = request.method.toUpperCase();
        const isReadonly = READONLY_METHODS.includes(method);

        let branch: Branch | null;

        if (isReadonly) {
            branch = await this.cacheService.GetOrCreateWithLock(BranchKey(branchId), {
                getFunc: () => this.LoadFromDb(branchId),
                ttl: BranchCacheTTL,
            });
        } else {
            branch = await this.LoadFromDb(branchId);
        }

        if (branch === null) throw new NotFoundException("Branch not found");
        const adminAbility = this.abilityFactory.defineAbilityForAdmin(admin);
        ForbiddenError.from(adminAbility).throwUnlessCan(Action.Manage, branch);
        request.branch = branch;
        return true;
    }

    async LoadFromDb(branchhId: string) {
        return await this.branchRepository.findOne(
            {
                id: branchhId,
            },
            { populate: ["admins"] },
        );
    }
}
