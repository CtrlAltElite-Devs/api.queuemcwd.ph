import { IsBoolean, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateSlotDto {
    @IsOptional()
    @IsNumber()
    @Min(1, { message: "limit should be at minimum 1" })
    limit?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
