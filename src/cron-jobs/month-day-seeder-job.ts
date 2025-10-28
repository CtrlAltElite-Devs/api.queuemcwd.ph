import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { getNextMonthMetadata } from "./utilities/get-current-month-data.util";
import { MonthDay } from "src/entities/monthDay.entity";
import { createMonthDays } from "./utilities/generate-month-days.util";
import moment from "moment";

@Injectable()
export class MonthDaySeederJob {
    private readonly logger = new Logger(MonthDaySeederJob.name);
    constructor(private readonly em: EntityManager) {}
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleCron(){
        const now = moment();
        const lastDayOfMonth = now.clone().endOf('month');
        const daysUntilEnd = lastDayOfMonth.diff(now, 'days');

        if (daysUntilEnd >= 7) {
            this.logger.log("Not yet within the last week of the month. Skipping seeding...");
            return;
        }

        this.logger.log("Seeding Month Day Table");
        const nextMonthMetaData = getNextMonthMetadata();
        const { month, year } = nextMonthMetaData;
        const emInstance = this.em.fork();
        const exists =  await emInstance.findOne(MonthDay, {month: month, year: year});
        if(exists !== null){
            this.logger.log("Seeding Current Month already seeded");
            return;
        } else {
            try{
                this.logger.log(`Seeding for current month: ${month} year: ${year}`);
                const monthDays = createMonthDays(nextMonthMetaData);
                await emInstance.persistAndFlush(monthDays);
                this.logger.log("Month days and slots successfully seeded");
            }catch(error){
                this.logger?.log?.('Failed to insert month days:', error);
            }
        }
    }
}