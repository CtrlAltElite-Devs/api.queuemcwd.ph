import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Cache } from "cache-manager";
import { RedisService } from "./redis-service";

export type GetOrCreateOptions<T> = {
    factory: () => Promise<T>;
    ttl?: number;
};

@Injectable()
export class CacheService {
    private readonly logger = new Logger(CacheService.name);

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly redisService: RedisService,
    ) {}

    async GetOrCreate<T>(key: string, options: GetOrCreateOptions<T>): Promise<T> {
        return await this.redisService.GetOrCreate<T>(key, options.factory, options.ttl);
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

    async Delete(key: string | string[]): Promise<void> {
        if (Array.isArray(key)) {
            for (const k of key) await this.Delete(k);
            return;
        }

        // If using Redis, allow wildcards
        if (key.includes("*")) {
            await this.redisService.invalidateByPattern(key);
        } else {
            await this.cacheManager.del(key);
            this.logger.debug(`Deleted cache for key: ${key}`);
        }
    }

    async Clear(): Promise<void> {
        await this.cacheManager.clear();
        this.logger.warn("Cleared all cache entries");
    }
}
