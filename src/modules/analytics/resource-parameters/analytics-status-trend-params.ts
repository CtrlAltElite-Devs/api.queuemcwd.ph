import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class AnalyticsStatusTrendParams {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    branchId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    days?: number;
}
