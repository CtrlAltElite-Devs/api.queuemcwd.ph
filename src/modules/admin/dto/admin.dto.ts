import { ApiProperty } from "@nestjs/swagger";
import { Admin, AdminRole } from "src/entities/admin.entity";

export class AdminDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: AdminRole;

    @ApiProperty()
    branchId?: string;

    static Map(admin: Admin): AdminDto {
        const dto = new AdminDto();
        dto.id = admin.id;
        dto.email = admin.email;
        dto.role = admin.role;
        dto.branchId = admin.branch?.id;
        return dto;
    }
}
