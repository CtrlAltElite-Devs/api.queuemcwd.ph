import { QBFilterQuery } from "@mikro-orm/core";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsDate } from "class-validator";
import { Type } from "class-transformer";
import { Appointment } from "src/entities/appointment.entity";
import { AppointmentType } from "src/enums/appointment-type.enum";

export class AppointmentResourceParameter {
    @ApiPropertyOptional({ example: "2025-03-20T00:00:00Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    from?: Date;

    @ApiPropertyOptional({ example: "2025-03-21T00:00:00Z" })
    @IsOptional()
    @Type(() => Date)
    @IsDate()
    to?: Date;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(AppointmentType)
    appointmentType?: AppointmentType;

    GetFilters(): QBFilterQuery<Appointment> {
        const filters: QBFilterQuery<Appointment> = {};

        if (this.appointmentType) {
            filters.appointmentType = this.appointmentType;
        }

        if (this.from || this.to) {
            filters.dateValidity = {
                ...(this.from && { $gte: this.from }),
                ...(this.to && { $lte: this.to }),
            };
        }

        return filters;
    }
}
