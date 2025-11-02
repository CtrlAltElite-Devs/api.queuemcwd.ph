import { EntityRepository } from "@mikro-orm/mysql";
import { MonthDay } from "src/entities/monthDay.entity";
import { MonthDayResourceParameter } from "src/modules/month-day/resource-parameters/month-day.params";

export class MonthDayRepository extends EntityRepository<MonthDay> {
    async GetMonthDayForBranchAsync(branchId: string, params: MonthDayResourceParameter) {
        const monthDayQuery = this.createQueryBuilder().where({ branch: { id: branchId } });

        monthDayQuery.andWhere(params.GetFilters()).orderBy({
            year: "ASC",
            month: "ASC",
            day: "ASC",
        });
        return await monthDayQuery.getResult();
    }
}
