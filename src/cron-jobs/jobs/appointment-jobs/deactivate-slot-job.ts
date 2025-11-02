import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { BaseJob } from "src/cron-jobs/base.job";
import { JobRecordType } from "src/cron-jobs/startup-job-registry";
import { Slot } from "src/entities/slot.entity";

@Injectable()
export class DeactivateSlotJob extends BaseJob {
    constructor(
        private readonly em: EntityManager,
        schedulerRegistry: SchedulerRegistry,
    ) {
        super(schedulerRegistry, DeactivateSlotJob.name);
    }

    @Cron(CronExpression.EVERY_5_MINUTES, { name: DeactivateSlotJob.name })
    async handle() {
        this.logger.log("Running scheduled slot deactivation...");
        await this.deactivatePastSlots();
    }

    protected async runStartupTask(): Promise<JobRecordType> {
        this.logger.log("Running startup slot deactivation check...");
        return this.deactivatePastSlots();
    }

    private async deactivatePastSlots(): Promise<JobRecordType> {
        try {
            const emInstance = this.em.fork();
            const result = await emInstance
                .createQueryBuilder(Slot)
                .update({ isActive: false })
                .where({
                    endTime: { $lt: new Date() },
                    isActive: true,
                })
                .execute();

            const count = result.affectedRows ?? 0;

            if (count === 0) {
                this.logger.log("No past slots found to deactivate.");
                return { status: "skipped", details: "No expired active slots." };
            }

            this.logger.log(`Deactivated ${count} slots.`);
            return { status: "executed", details: `Deactivated ${count} slots.` };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error("Error deactivating slots:", message);
            return { status: "failed", details: message };
        }
    }
}
