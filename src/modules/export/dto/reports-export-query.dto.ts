import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID } from "class-validator";

export class ReportsExportQueryDto {
    @ApiProperty()
    @IsUUID()
    branchId: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    to?: string;
}
