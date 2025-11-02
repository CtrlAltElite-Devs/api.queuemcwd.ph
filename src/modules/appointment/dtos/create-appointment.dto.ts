import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsUUID } from "class-validator";
import { AppointmentType } from "src/enums/appointment-type.enum";
import { CategoryCode } from "src/enums/category-code.enum";

export class CreateAppointmentDto {
    @ApiProperty()
    @IsUUID()
    slotId: string;

    @ApiProperty()
    @IsString()
    accountCode: string;

    @ApiProperty()
    @IsString()
    contactPerson: string;

    @ApiProperty()
    @IsString()
    contact: string;

    @ApiProperty()
    @IsEnum(CategoryCode)
    category: CategoryCode;

    @ApiProperty()
    @IsEnum(AppointmentType)
    appointmentType: AppointmentType;
}
