import { Injectable, OnModuleDestroy } from "@nestjs/common";
import type { RedisClientType } from "redis";

@Injectable()
export class RedisService implements OnModuleDestroy {
    constructor(private readonly client: RedisClientType) {}

    async invalidateByPattern(pattern: string): Promise<number> {
        const keys = await this.client.keys(pattern);
        if (keys.length === 0) {
            return 0;
        }
        return this.client.del(keys);
    }

    /**
     * Get value from Redis OR create it if missing (race-safe via SETNX).
     * @param key Redis key
     * @param factory Function that returns the value to generate when missing
     * @param ttlSeconds Optional expiration time in seconds
     */
    async GetOrCreate<T>(key: string, factory: () => Promise<T>, ttlSeconds?: number): Promise<T> {
        // 1. Try reading cached value
        const cached = await this.client.get(key);
        if (cached !== null) {
            return JSON.parse(cached) as T;
        }

        // 2. Create new value
        const createdValue = await factory();
        const createdValueJson = JSON.stringify(createdValue);

        // 3. Try to set only if key does not exist
        const wasSet = await this.client.setNX(key, createdValueJson);

        // 4. Key already set by another process — return existing
        if (!wasSet) {
            const updated = await this.client.get(key);
            return JSON.parse(updated!) as T;
        }

        // 5. Apply TTL if provided
        if (ttlSeconds) {
            await this.client.expire(key, ttlSeconds);
        }

        return createdValue;
    }

    onModuleDestroy() {
        this.client.destroy();
    }

    async isHealthy(): Promise<boolean> {
        try {
            const pong = await this.client.ping();
            return pong === "PONG";
        } catch (err) {
            console.error("Redis health check failed", err);
            return false;
        }
    }
}
