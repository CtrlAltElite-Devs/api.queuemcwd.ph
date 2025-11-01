import { ApiProperty } from "@nestjs/swagger";
import { Slot } from "src/entities/slot.entity";

export class SlotDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    dayId: string;

    @ApiProperty()
    startTime: Date;

    @ApiProperty()
    endTime: Date;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    maxCapacity: number;

    @ApiProperty()
    booked: number;

    static Map(slot: Slot): SlotDto {
        const dto = new SlotDto();
        dto.id = slot.id;
        dto.dayId = slot.monthDay.id;
        dto.startTime = slot.startTime;
        dto.endTime = slot.endTime;
        dto.maxCapacity = slot.limit;
        dto.isActive = slot.isActive;
        return dto;
    }
}
