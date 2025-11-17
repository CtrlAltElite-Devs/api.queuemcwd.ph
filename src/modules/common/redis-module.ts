import { Global, Module } from "@nestjs/common";
import { createClient, RedisClientType } from "redis";
import { redisEnv } from "src/configurations/env/redis.env";
import { RedisService } from "./redis-service";

@Global()
@Module({
    providers: [
        {
            provide: RedisService,
            useFactory: async () => {
                const client: RedisClientType = createClient({
                    url: redisEnv.REDIS_URL,
                });

                client.on("error", (err) => {
                    console.error("Redis Client Error", err);
                });

                await client.connect();
                console.log("Redis connected");

                return new RedisService(client);
            },
        },
    ],
    exports: [RedisService],
})
export class RedisClientModule {}
