import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { getCurrentMonthMetadata } from "src/cron-jobs/utilities/get-current-month-data";
import { MonthDay } from '../entities/monthDay.entity';
import { Logger } from "@nestjs/common";
import { createMonthDays } from '../cron-jobs/utilities/generate-month-days';

export class MonthDaySeeder extends Seeder {
    private readonly logger = new Logger(MonthDaySeeder.name);
    async run(em: EntityManager): Promise<void> {
        const currentMonthMetaData = getCurrentMonthMetadata();
        const { month, year } = currentMonthMetaData;

        const exists =  await em.findOne(MonthDay, {month: month, year: year});

        if(exists !== null){
            this.logger.log("Current Month already seeded");
            return;
        } else {
            try{
                this.logger.log(`Seeding for current month: ${month} year: ${year}`);
                const monthDays = createMonthDays(currentMonthMetaData);
                await em.persistAndFlush(monthDays);
                this.logger.log("Month days and slots successfully seeded");
            }catch(error){
                this.logger?.log?.('Failed to insert month days:', error);
            }
        }
    }
}