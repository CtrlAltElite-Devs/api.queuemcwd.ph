import { ApiProperty } from "@nestjs/swagger";
import { Slot } from "src/entities/slot.entity";
import { BranchDto } from "src/modules/branch/dto/branch.dto";
import { MonthDayDto } from "src/modules/month-day/dtos/month-day.dto";

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

    @ApiProperty()
    branch: BranchDto;

    @ApiProperty()
    monthDay: MonthDayDto;

    static Map(slot: Slot): SlotDto {
        const dto = new SlotDto();
        dto.id = slot.id;
        dto.dayId = slot.monthDay.id;
        dto.startTime = slot.startTime;
        dto.endTime = slot.endTime;
        dto.maxCapacity = slot.limit;
        dto.isActive = slot.isActive;
        dto.branch = BranchDto.Map(slot.branch);
        dto.monthDay = MonthDayDto.Map(slot.monthDay);
        return dto;
    }
}
