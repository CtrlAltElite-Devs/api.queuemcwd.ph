import { EntityManager } from "@mikro-orm/mysql";
import { Injectable, Logger } from "@nestjs/common";
import { determineCacheInvalidationKeys } from "src/constants/cache.constants";
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
                const inputKeys = Array.isArray(options.invalidateKeys)
                    ? options.invalidateKeys
                    : [options.invalidateKeys];

                const keysToInvalidate = determineCacheInvalidationKeys(inputKeys);

                for (const key of keysToInvalidate) {
                    await this.cacheService.Delete(key);
                }

                this.logger.debug(
                    `Invalidated ${keysToInvalidate.length} cache entr${keysToInvalidate.length > 1 ? "ies" : "y"} after commit`,
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
