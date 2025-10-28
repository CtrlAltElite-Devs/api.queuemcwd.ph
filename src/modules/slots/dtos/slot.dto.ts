import { ApiProperty } from "@nestjs/swagger";

export class SlotDto{
    @ApiProperty()
    id: string;

    @ApiProperty()
    dayId: string;

    @ApiProperty()
    startTime: Date

    @ApiProperty()
    endTime: Date

    @ApiProperty()
    isActive: boolean

    @ApiProperty()
    maxCapacity: number

    @ApiProperty()
    booked: number
}