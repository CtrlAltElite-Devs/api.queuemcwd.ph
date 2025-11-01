import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class UnitOfWork {
    private readonly logger = new Logger(UnitOfWork.name);

    constructor(private readonly em: EntityManager) {}

    async Commit() {
        try {
            await this.em.begin();
            await this.em.commit();
            this.logger.log(`Transaction Committed`);
        } catch (error) {
            await this.em.rollback();
            this.logger.error(`Failed to commit changes, ${error}`);
            throw error;
        }
    }
}
