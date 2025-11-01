import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import moment from "moment";
import { Branch } from "src/entities/branch.entity";
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

        const branches = await em.findAll(Branch);
        if (branches.length === 0) {
            this.logger.log("No branches found. Skipping month day seeding for branches.");
            return;
        }

        for (const branch of branches) {
            const existsForBranch = await em.findOne(MonthDay, {
                month,
                year,
                branch,
            });

            if (existsForBranch) {
                this.logger.log(
                    `MonthDays for branch ${branch.name} (${branch.id}) already exist for ${month}/${year}`,
                );
                continue;
            }

            this.logger.log(
                `Seeding MonthDays for branch ${branch.name} (${branch.id}) for ${month}/${year}`,
            );
            try {
                const monthDays = createMonthDays(branch, nextMonthMetaData);
                await em.persistAndFlush(monthDays);
                this.logger.log(
                    `MonthDays seeded successfully for branch ${branch.name} (${branch.id})`,
                );
            } catch (error) {
                this.logger.error(
                    `Failed to seed MonthDays for branch ${branch.name} (${branch.id}): ${error}`,
                );
            }
        }

        this.logger.log("Next month MonthDay seeding complete");
    }
}
