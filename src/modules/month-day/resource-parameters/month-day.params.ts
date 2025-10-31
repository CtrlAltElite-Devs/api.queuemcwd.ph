import { QBFilterQuery } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { MonthDay } from "src/entities/monthDay.entity";

export class MonthDayResourceParameter {
  @ApiProperty({ required: false })
  month?: number;

  @ApiProperty({ required: false })
  day: number;

  @ApiProperty({ required: false })
  year: number;

  GetFilters(): QBFilterQuery<MonthDay> {
    return {
      ...(this.month && { month: this.month }),
      ...(this.day && { day: this.day }),
      ...(this.year && { year: this.year }),
    };
  }
}
