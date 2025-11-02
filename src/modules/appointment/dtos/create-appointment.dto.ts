import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsUUID } from "class-validator";
import { AppointmentType } from "src/enums/appointment-type.enum";
import { CategoryCode } from "src/enums/category-code.enum";

export class CreateAppointmentDto {
    @ApiProperty()
    @IsUUID()
    slotId: string;

    @ApiProperty()
    accountCode: string;

    @ApiProperty()
    contactPerson: string;

    @ApiProperty()
    contact: string;

    @ApiProperty()
    @IsEnum(CategoryCode)
    category: CategoryCode;

    @ApiProperty()
    @IsEnum(AppointmentType)
    appointmentType: AppointmentType;
}
