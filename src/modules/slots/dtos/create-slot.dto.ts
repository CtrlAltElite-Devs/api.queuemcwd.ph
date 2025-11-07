import { IsNumber, IsUUID, Matches, Min } from "class-validator";

export class CreateSlotDto {
    @IsUUID()
    monthDayId: string;

    @IsNumber()
    @Min(1, { message: "limit should be at minimum 1" })
    limit: number;

    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: "startTime must be in HH:mm format" })
    startTime: string;

    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, { message: "endTime must be in HH:mm format" })
    endTime: string;
}
