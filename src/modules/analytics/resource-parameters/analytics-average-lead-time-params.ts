import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class AnalyticsAverageLeadTimeParams {
    @ApiProperty({ required: false })
    @IsUUID()
    branchId?: string;

    @IsOptional()
    days?: number;
}
