import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Appointment } from "src/entities/appointment.entity";
import { QueueStatus } from "src/enums/queue-status.enum";

@Injectable()
export class ExpireAppointmentsJob {
    private readonly logger = new Logger(ExpireAppointmentsJob.name);

    constructor(private readonly em: EntityManager) {}

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async handle() {
        try {
            const emInstance = this.em.fork();
            const result = await emInstance.createQueryBuilder(Appointment)
                .update({
                    queueStatus: QueueStatus.EXPIRED,
                })
                .where({
                    queueStatus: QueueStatus.ACTIVE,
                    dateValidity: { $lt: new Date() }
                })
                .execute();
            
                this.logger.log(`Expired ${result.affectedRows} appointments.`);
        } catch (error) {
            this.logger.error("Error expiring appointments:", error);
        }
    }
}