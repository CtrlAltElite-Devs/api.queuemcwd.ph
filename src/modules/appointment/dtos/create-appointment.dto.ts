import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { CategoryCode } from "src/entities/appointment.entity";

export class CreateAppointmentDto{
    @ApiProperty()
    slotId: string;

    @ApiProperty()
    @IsEnum(CategoryCode)
    category: CategoryCode;

    @ApiProperty()
    age: number
}