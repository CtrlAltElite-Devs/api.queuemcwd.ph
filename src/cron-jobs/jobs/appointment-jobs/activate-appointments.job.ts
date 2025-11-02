import { EntityManager } from "@mikro-orm/mysql";
import { Injectable } from "@nestjs/common";
import { Cron, CronExpression, SchedulerRegistry } from "@nestjs/schedule";
import { BaseJob } from "src/cron-jobs/base.job";
import { JobRecordType } from "src/cron-jobs/startup-job-registry";
import { Appointment } from "src/entities/appointment.entity";
import { QueueStatus } from "src/enums/queue-status.enum";

@Injectable()
export class ActivateAppointmentsJob extends BaseJob {
    constructor(
        private readonly em: EntityManager,
        schedulerRegistry: SchedulerRegistry,
    ) {
        super(schedulerRegistry, ActivateAppointmentsJob.name);
    }

    @Cron(CronExpression.EVERY_MINUTE, { name: ActivateAppointmentsJob.name })
    async handle() {
        this.logger.log("Running scheduled activation check...");
        await this.activatePendingAppointments();
    }

    // This runs automatically at startup (from BaseJob.onModuleInit)
    protected async runStartupTask(): Promise<JobRecordType> {
        return this.activatePendingAppointments();
    }

    private async activatePendingAppointments(): Promise<JobRecordType> {
        try {
            const emInstance = this.em.fork();
            const result = await emInstance
                .createQueryBuilder(Appointment)
                .update({ queueStatus: QueueStatus.ACTIVE })
                .where({
                    queueStatus: QueueStatus.PENDING,
                    dateValidity: { $gte: new Date() },
                })
                .execute();

            const count = result.affectedRows ?? 0;

            if (count === 0) {
                this.logger.log("No appointments activated — none matched the criteria.");
                return { status: "skipped", details: "No pending appointments found." };
            }

            this.logger.log(`Activated ${count} appointments.`);
            return { status: "executed", details: `Activated ${count} appointments.` };
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.error("Error activating appointments:", message);
            return { status: "failed", details: message };
        }
    }
}
