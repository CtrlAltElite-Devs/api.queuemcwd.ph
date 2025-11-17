import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext, Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { Request } from "express";
import { BranchDataCacheKey } from "src/constants/cache.constants";

@Injectable()
export class DynamicCacheInterceptor extends CacheInterceptor {
    private readonly logger = new Logger(DynamicCacheInterceptor.name);

    protected trackBy(context: ExecutionContext): string | undefined {
        const request = context.switchToHttp().getRequest<Request>();

        if (request.method !== "GET") return undefined;

        const { params, query } = request;

        // Build a hash of the request data
        const hash = crypto
            .createHash("md5")
            .update(JSON.stringify({ params, query }))
            .digest("hex");

        // Prefix with branch:monthDays
        const prefixedHash = `${BranchDataCacheKey}:${hash}`;

        this.logger.debug(`Generated cache key: ${prefixedHash}`);

        return prefixedHash;
    }
}
