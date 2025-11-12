import { UnauthorizedException } from "@nestjs/common";
import { BranchAdminError } from "src/constants/error-messages/branch-admin.error";
import { AdminRole } from "src/entities/admin.entity";
import { Branch } from "src/entities/branch.entity";
import { AdminDto } from "src/modules/admin/dto/admin.dto";

export class BranchAdminValidator {
    static EnsureIsAssignedToBranch(admin: AdminDto, branch: Branch) {
        if (admin.role === AdminRole.SUPER_ADMIN) {
            return;
        }

        if (admin.branchId === undefined) {
            throw new UnauthorizedException(BranchAdminError.NOT_ASSIGNED);
        }

        if (admin.branchId !== branch.id) {
            throw new UnauthorizedException(BranchAdminError.NOT_ASSIGNED);
        }
    }
}
