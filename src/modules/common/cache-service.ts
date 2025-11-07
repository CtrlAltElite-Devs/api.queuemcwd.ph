import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Cache } from "cache-manager";

export type GetOrCreateOptions<T> = {
    getFunc: () => Promise<T>;
    ttl?: number;
};

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);
    private pending = new Map<string, Promise<unknown>>();

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    async GetOrCreateWithLock<T>(key: string, options: GetOrCreateOptions<T>): Promise<T> {
        const cached = await this.cacheManager.get<T>(key);

        if (cached !== undefined) {
            this.logger.debug(`Cache hit for key: ${key}`);
            return cached;
        }

        this.logger.debug(`Cache miss for key: ${key}`);

        if (this.pending.has(key)) {
            this.logger.debug(`Awaiting pending fetch for key: ${key}`);
            return this.pending.get(key)! as Promise<T>;
        }

        const promise = options
            .getFunc()
            .then(async (value) => {
                this.logger.debug(`Fetched and caching value for key: ${key}`);
                await this.cacheManager.set(key, value, options.ttl);
                this.pending.delete(key);
                return value;
            })
            .catch((err: Error) => {
                this.logger.error(`Error fetching value for key: $  {key}`, err.stack || err);
                this.pending.delete(key);
                throw err;
            });

        this.pending.set(key, promise);
        return promise;
    }

    async Get<T>(key: string): Promise<T | undefined> {
        const value = await this.cacheManager.get<T>(key);
        this.logger.debug(value !== undefined ? `Cache hit: ${key}` : `Cache miss: ${key}`);
        return value;
    }

    async Set<T>(key: string, value: T, ttl?: number): Promise<void> {
        await this.cacheManager.set(key, value, ttl);
        this.logger.debug(`Set cache for key: ${key} (ttl: ${ttl ?? "default"})`);
    }

    async Delete(key: string): Promise<void> {
        await this.cacheManager.del(key);
        this.logger.debug(`Deleted cache for key: ${key}`);
    }

    async Clear(): Promise<void> {
        await this.cacheManager.clear();
        this.logger.warn("Cleared all cache entries");
    }
}
