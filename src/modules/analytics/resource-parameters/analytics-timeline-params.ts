import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsUUID } from "class-validator";

export class AnalyticsTimelineParams {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    branchId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    from?: string; // 'YYYY-MM-DD'

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    to?: string; // 'YYYY-MM-DD'

    @ApiProperty({ required: false })
    @IsOptional()
    days?: number;
}
