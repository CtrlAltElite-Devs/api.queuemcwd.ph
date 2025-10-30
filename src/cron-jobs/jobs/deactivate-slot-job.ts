import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Slot } from "src/entities/slot.entity";

@Injectable()
export class DeactivateSlotJob {
    private readonly logger = new Logger(DeactivateSlotJob.name);

    constructor(private readonly em: EntityManager) {}

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handle(){
        try {
            this.logger.log("Deactivating past slots...");
            const emInstance = this.em.fork();
            const result = await emInstance.createQueryBuilder(Slot)
                .update({
                    isActive: false,
                })
                .where({
                    endTime: { $lt: new Date() },
                    isActive: true
                })
                .execute();

            this.logger.log(`Deactivated ${result.affectedRows} slots.`);
        } catch (error) {
            this.logger.error("Error deactivating slots:", error);
        }
    }
}