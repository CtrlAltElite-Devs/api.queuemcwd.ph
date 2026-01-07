import { QBFilterQuery } from "@mikro-orm/core";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsOptional } from "class-validator";
import { Appointment } from "src/entities/appointment.entity";
import { AppointmentType } from "src/enums/appointment-type.enum";

export class AppointmentResourceParameter {
    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    from?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsDateString()
    to?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(AppointmentType)
    appointmentType: AppointmentType;

    GetFilters(): QBFilterQuery<Appointment> {
        const filters: QBFilterQuery<Appointment> = {};

        if (this.appointmentType) {
            filters.appointmentType = this.appointmentType;
        }

        if (this.from || this.to) {
            filters.createdAt = {
                ...(this.from && { $gte: new Date(this.from) }),
                ...(this.to && { $lte: new Date(this.to) }),
            };
        }

        return filters;
    }
}
