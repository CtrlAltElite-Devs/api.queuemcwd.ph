import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsUUID } from "class-validator";
import { AppointmentType } from "src/enums/appointment-type.enum";

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
    @IsEnum(AppointmentType)
    appointmentType: AppointmentType;
}
