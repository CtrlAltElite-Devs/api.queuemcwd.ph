import { QBFilterQuery } from "@mikro-orm/core";
import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsUUID } from "class-validator";
import { MonthDay } from "src/entities/monthDay.entity";

export class MonthDayResourceParameter {
    @ApiProperty({ required: true })
    @IsUUID()
    branchId: string;

    @ApiProperty({ required: true })
    @IsNumber()
    month: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    day: number;

    @ApiProperty({ required: true })
    @IsNumber()
    year: number;

    GetFilters(): QBFilterQuery<MonthDay> {
        return {
            branch: this.branchId,
            month: this.month,
            year: this.year,
            ...(this.day && { day: this.day }),
        };
    }

    Validate() {
        if (!this.branchId) {
            throw new BadRequestException("branchId is required.");
        }

        if (!this.month || this.month < 1 || this.month > 12) {
            throw new BadRequestException("month must be between 1 and 12.");
        }

        if (!this.year || this.year < 1900 || this.year > 2100) {
            throw new BadRequestException("year must be a valid 4-digit year.");
        }

        if (this.day && (this.day < 1 || this.day > 31)) {
            throw new BadRequestException("day must be between 1 and 31.");
        }
    }
}
