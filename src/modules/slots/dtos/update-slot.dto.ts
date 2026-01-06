import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, Matches, Min } from "class-validator";

export class UpdateSlotDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1, { message: "limit should be at minimum 1" })
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: "startTime must be in HH:mm format" })
    startTime?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: "endTime must be in HH:mm format" })
    endTime?: string;
}
