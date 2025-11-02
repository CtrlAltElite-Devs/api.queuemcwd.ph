import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import moment from "moment";
import { BaseJob } from "src/cron-jobs/base.job";
import { JobRecordType } from "src/cron-jobs/startup-job-registry";
import { Branch } from "src/entities/branch.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { createMonthDays } from "src/utils/generate-month-days.util";
import { getNextMonthMetadata } from "src/utils/get-current-month-data.util";

@Injectable()
export class MonthDaySeederJob extends BaseJob {
    constructor(
        private readonly em: EntityManager,
        schedulerRegistry: SchedulerRegistry,
    ) {
        super(schedulerRegistry, MonthDaySeederJob.name);
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: MonthDaySeederJob.name })
    async handleCron() {
        await this.seedNextMonthIfNeeded();
    }

    protected async runStartupTask(): Promise<JobRecordType> {
        return await this.seedNextMonthIfNeeded();
    }

    private async seedNextMonthIfNeeded(): Promise<JobRecordType> {
        const now = moment();
        const lastDayOfMonth = now.clone().endOf("month");
        const daysUntilEnd = lastDayOfMonth.diff(now, "days");

        if (daysUntilEnd >= 7) {
            this.logger.log("Not yet within the last week of the month. Skipping seeding...");
            return { status: "skipped", details: "Too early for next month seeding" };
        }

        this.logger.log("Seeding Month Day Table for Next Month");
        const nextMonthMetaData = getNextMonthMetadata();
        const { month, year } = nextMonthMetaData;

        const branches = await this.em.findAll(Branch);
        if (branches.length === 0) {
            const msg = "No branches found. Skipping month day seeding for branches.";
            this.logger.log(msg);
            return { status: "skipped", details: msg };
        }

        let seededCount = 0;

        for (const branch of branches) {
            const existsForBranch = await this.em.findOne(MonthDay, {
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
                await this.em.persistAndFlush(monthDays);
                seededCount++;
                this.logger.log(
                    `MonthDays seeded successfully for branch ${branch.name} (${branch.id})`,
                );
            } catch (error) {
                this.logger.error(
                    `Failed to seed MonthDays for branch ${branch.name} (${branch.id}): ${error}`,
                );
            }
        }

        const summary =
            seededCount > 0
                ? `Seeded next-month days for ${seededCount} branches`
                : "All branches already seeded";
        this.logger.log("Next month MonthDay seeding complete");
        return { status: "executed", details: summary };
    }
}
