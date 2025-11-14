import { ApiProperty } from "@nestjs/swagger";
import { Admin, AdminRole } from "src/entities/admin.entity";
import { BranchDto } from "src/modules/branch/dto/branch.dto";

export class AdminDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: AdminRole;

    @ApiProperty()
    branchId?: string;

    @ApiProperty()
    branch?: BranchDto;

    static Map(admin: Admin): AdminDto {
        const dto = new AdminDto();
        dto.id = admin.id;
        dto.email = admin.email;
        dto.role = admin.role;
        dto.branchId = admin.branch?.id;
        dto.branch = admin.branch ? BranchDto.Map(admin.branch) : undefined;
        return dto;
    }
}
