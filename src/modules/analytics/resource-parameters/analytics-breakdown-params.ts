import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsUUID, Matches } from "class-validator";

export class AnalyticsStatusBreakdownParams {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    branchId?: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: "from must be a valid date in YYYY-MM-DD format",
    })
    from?: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: "to must be a valid date in YYYY-MM-DD format",
    })
    to?: string;
}
