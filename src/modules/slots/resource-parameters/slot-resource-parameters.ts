import { ApiProperty } from "@nestjs/swagger"

export class SlotResourceParameter {
    @ApiProperty()
    month: number

    @ApiProperty()
    day: number

    @ApiProperty()
    year: number 
}