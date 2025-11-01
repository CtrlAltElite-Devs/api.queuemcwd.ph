import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import { getCurrentMonthMetadata } from "src/utils/get-current-month-data.util";
import { Branch } from "../entities/branch.entity";
import { MonthDay } from "../entities/monthDay.entity";
import { createMonthDays } from "../utils/generate-month-days.util";

export class MonthDaySeeder extends Seeder {
    private readonly logger = new Logger(MonthDaySeeder.name);

    async run(em: EntityManager): Promise<void> {
        const currentMonthMetadata = getCurrentMonthMetadata();
        const { month, year } = currentMonthMetadata;

        const branches = await em.findAll(Branch);
        if (branches.length === 0) {
            this.logger.log("No branches found. Skipping MonthDay seeding for current month.");
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
                const monthDays = createMonthDays(branch, currentMonthMetadata);
                await em.persistAndFlush(monthDays);
                this.logger.log(
                    `MonthDays successfully seeded for branch ${branch.name} (${branch.id})`,
                );
            } catch (error) {
                this.logger.error(
                    `Failed to seed MonthDays for branch ${branch.name} (${branch.id}): ${error}`,
                );
            }
        }

        this.logger.log("Current month MonthDay seeding complete");
    }
}
