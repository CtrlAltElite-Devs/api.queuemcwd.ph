import { QBFilterQuery } from "@mikro-orm/core";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsDate, IsInt, Min, Max } from "class-validator";
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

    @ApiPropertyOptional({ example: 1, default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10, default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;

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
