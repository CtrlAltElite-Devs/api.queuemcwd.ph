import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class AnalyticsTopUsersParams {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    branchId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    limit?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    days?: number;
}
