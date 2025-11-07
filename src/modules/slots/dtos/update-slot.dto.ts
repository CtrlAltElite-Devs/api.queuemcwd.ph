import { IsBoolean, IsNumber, IsOptional, Matches, Min } from "class-validator";

export class UpdateSlotDto {
    @IsOptional()
    @IsNumber()
    @Min(1, { message: "limit should be at minimum 1" })
    limit?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: "startTime must be in HH:mm format" })
    startTime?: string;

    @IsOptional()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: "endTime must be in HH:mm format" })
    endTime?: string;
}
