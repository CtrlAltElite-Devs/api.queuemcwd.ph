import {
    AbilityBuilder,
    createMongoAbility,
    ExtractSubjectType,
    InferSubjects,
    MongoAbility,
} from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { BranchAdminError } from "src/constants/error-messages/branch-admin.error";
import { AdminRole } from "src/entities/admin.entity";
import { Branch } from "src/entities/branch.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { AdminDto } from "src/modules/admin/dto/admin.dto";

export enum Action {
    Manage = "manage",
    Create = "create",
    Read = "read",
    Update = "update",
    Delete = "delete",
}

export type Subjects = InferSubjects<typeof AdminDto | typeof Branch | typeof MonthDay> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
    defineAbilityForAdmin(admin: AdminDto) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

        if (admin.role === AdminRole.SUPER_ADMIN) {
            can(Action.Manage, "all");
        } else {
            if (!admin.branchId) {
                cannot(Action.Manage, Branch).because(BranchAdminError.NOT_ASSIGNED);
            } else {
                can(Action.Manage, Branch);
                cannot(Action.Manage, Branch, { id: { $ne: admin.branchId } }).because(
                    BranchAdminError.NOT_ASSIGNED,
                );
            }
        }

        return build({
            detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}
