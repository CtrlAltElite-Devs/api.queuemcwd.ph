import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional, IsUUID } from "class-validator";
import { AppointmentType } from "src/enums/appointment-type.enum";

export class AnalyticsOverviewParams {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsUUID()
    branchId?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    from?: string; // 'YYYY-MM-DD'

    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    to?: string; // 'YYYY-MM-DD'

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(AppointmentType)
    appointmentType?: AppointmentType;
}
