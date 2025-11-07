import { Module } from "@nestjs/common";
import { CacheService } from "./cache-service";
import { CustomJwtService } from "./custom-jwt-service";
import { UnitOfWork } from "./unit-of-work";

@Module({
    providers: [UnitOfWork, CustomJwtService, CacheService],
    exports: [UnitOfWork, CustomJwtService, CacheService],
})
export class CommonModule {}
