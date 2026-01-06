import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateMonthDayDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isWorkingDay?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    additionalNotes?: string;
}
