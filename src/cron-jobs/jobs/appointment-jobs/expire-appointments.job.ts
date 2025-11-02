import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { BaseJob } from "src/cron-jobs/base.job";
import { JobRecordType } from "src/cron-jobs/startup-job-registry";
import { Appointment } from "src/entities/appointment.entity";
import { QueueStatus } from "src/enums/queue-status.enum";

@Injectable()
export class ExpireAppointmentsJob extends BaseJob {
    constructor(
        private readonly em: EntityManager,
        schedulerRegistry: SchedulerRegistry,
    ) {
        super(schedulerRegistry, ExpireAppointmentsJob.name);
    }

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT, { name: ExpireAppointmentsJob.name })
    async handle() {
        this.logger.log("Running scheduled expiry job...");
        await this.expireOldAppointments();
    }

    protected async runStartupTask(): Promise<JobRecordType> {
        this.logger.log("Running startup expiry check...");
        return await this.expireOldAppointments();
    }

    private async expireOldAppointments(): Promise<JobRecordType> {
        try {
            const emInstance = this.em.fork();
            const result = await emInstance
                .createQueryBuilder(Appointment)
                .update({
                    queueStatus: QueueStatus.EXPIRED,
                })
                .where({
                    queueStatus: QueueStatus.ACTIVE,
                    dateValidity: { $lt: new Date() },
                })
                .execute();

            const count = result.affectedRows ?? 0;

            if (count === 0) {
                this.logger.log("No expired appointments found.");
                return { status: "skipped", details: "No active appointments to expire." };
            }

            this.logger.log(`Expired ${count} appointments.`);
            return { status: "executed", details: `Expired ${count} appointments.` };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error("Error expiring appointments:", message);
            return { status: "failed", details: message };
        }
    }
}
