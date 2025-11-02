import { ApiProperty } from "@nestjs/swagger";
import { Admin } from "src/entities/admin.entity";

export class AdminDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    role: string;

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
