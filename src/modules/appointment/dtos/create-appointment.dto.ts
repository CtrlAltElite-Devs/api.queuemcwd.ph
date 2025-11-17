import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsUUID } from "class-validator";
import { AppointmentType } from "src/enums/appointment-type.enum";
import { IsNumericString } from "../validators/account-code-validator.decorator";

export class CreateAppointmentDto {
    @ApiProperty()
    @IsUUID()
    slotId: string;

    @ApiProperty()
    @IsString()
    @IsNumericString({ message: "Account code must contain only numbers" })
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
