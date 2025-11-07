import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, IsInt, IsOptional, Max, Min, ValidateNested } from "class-validator";

class TimeRangeDto {
    @ApiPropertyOptional()
    @IsInt()
    @Min(0)
    @Max(23)
    startHour: number;

    @ApiPropertyOptional()
    @IsInt()
    @Min(1)
    @Max(24)
    endHour: number;
}

export class CreateMonthDayOptionsDto {
    @ApiPropertyOptional({ example: 8 })
    @IsOptional()
    @IsInt()
    startHour?: number;

    @ApiPropertyOptional({ example: 15 })
    @IsOptional()
    @IsInt()
    endHour?: number;

    @ApiPropertyOptional({ example: 60 })
    @IsOptional()
    @IsInt()
    incrementMinutes?: number;

    @ApiPropertyOptional({ type: [TimeRangeDto] })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TimeRangeDto)
    excludeTimes?: TimeRangeDto[];
}
