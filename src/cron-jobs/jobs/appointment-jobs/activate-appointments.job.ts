import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Appointment } from "src/entities/appointment.entity";
import { QueueStatus } from "src/enums/queue-status.enum";

@Injectable()
export class ActivateAppointmentsJob {
  private readonly logger = new Logger(ActivateAppointmentsJob.name);

  constructor(private readonly em: EntityManager) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handle() {
    try {
      this.logger.log("Activating appointments...");
      const emInstance = this.em.fork();
      const result = await emInstance
        .createQueryBuilder(Appointment)
        .update({
          queueStatus: QueueStatus.ACTIVE,
        })
        .where({
          queueStatus: QueueStatus.PENDING,
          dateValidity: { $gte: new Date() },
        })
        .execute();

      this.logger.log(`Activated ${result.affectedRows} appointments.`);
    } catch (error) {
      this.logger.error("Error activating appointments:", error);
    }
  }
}
