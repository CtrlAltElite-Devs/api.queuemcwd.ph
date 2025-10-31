import { EntityRepository } from "@mikro-orm/mysql";
import { MonthDay } from "src/entities/monthDay.entity";
import { MonthDayResourceParameter } from "src/modules/month-day/resource-parameters/month-day.params";

export class MonthDayRepository extends EntityRepository<MonthDay> {
  async GetMonthDayAsync(params: MonthDayResourceParameter) {
    const monthDayQuery = this.createQueryBuilder().orderBy({
      year: "ASC",
      month: "ASC",
      day: "ASC",
    });

    monthDayQuery.where(params.GetFilters());

    return await monthDayQuery.getResult();
  }
}
