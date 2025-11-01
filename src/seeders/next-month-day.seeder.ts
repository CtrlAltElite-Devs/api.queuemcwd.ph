import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import moment from "moment";
import { MonthDay } from "src/entities/monthDay.entity";
import { createMonthDays } from "src/utils/generate-month-days.util";
import { getNextMonthMetadata } from "src/utils/get-current-month-data.util";

export class NextMonthDaySeeder extends Seeder {
  private readonly logger = new Logger(NextMonthDaySeeder.name);

  async run(em: EntityManager): Promise<void> {
    const now = moment();
    const lastDayOfMonth = now.clone().endOf("month");
    const daysUntilEnd = lastDayOfMonth.diff(now, "days");

    if (daysUntilEnd >= 7) {
      this.logger.log("Not yet within the last week of the month. Skipping seeding...");
      return;
    }

    this.logger.log("Seeding Month Day Table for Next Month");
    const nextMonthMetaData = getNextMonthMetadata();
    const { month, year } = nextMonthMetaData;
    const exists = await em.findOne(MonthDay, { month: month, year: year });

    if (exists !== null) {
      this.logger.log("Next Month already seeded");
      return;
    } else {
      try {
        this.logger.log(`Seeding for next month: ${month} year: ${year}`);
        const monthDays = createMonthDays(nextMonthMetaData);
        await em.persistAndFlush(monthDays);
        this.logger.log("Month days and slots for next month successfully seeded");
      } catch (error) {
        this.logger?.log?.("Failed to insert month days for next month:", error);
      }
    }
  }
}
