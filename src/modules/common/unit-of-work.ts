import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { CacheService } from "./cache-service";

export type CommitOptions = {
    invalidateKeys?: string | string[];
};

@Injectable()
export class UnitOfWork {
    private readonly logger = new Logger(UnitOfWork.name);

    constructor(
        private readonly em: EntityManager,
        private readonly cacheService: CacheService,
    ) {}

    async Commit(options?: CommitOptions) {
        try {
            await this.em.begin();
            await this.em.commit();
            this.logger.log(`Transaction committed successfully`);

            // ✅ Handle cache invalidation
            if (options?.invalidateKeys) {
                const keys = Array.isArray(options.invalidateKeys)
                    ? options.invalidateKeys
                    : [options.invalidateKeys];

                for (const key of keys) {
                    await this.cacheService.Delete(key);
                    this.logger.debug(`Invalidated cache key: ${key}`);
                }

                this.logger.log(
                    `Invalidated ${keys.length} cache entr${keys.length > 1 ? "ies" : "y"} after commit`,
                );
            }
        } catch (err) {
            const error = err as unknown as Error;
            await this.em.rollback();
            this.logger.error(`Failed to commit changes: ${error?.message ?? error}`);
            throw error;
        }
    }
}
