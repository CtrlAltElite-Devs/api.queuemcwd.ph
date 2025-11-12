import { Module } from "@nestjs/common";
import { AbilityFactory } from "src/security/ability/ability.factory";
import { CacheService } from "./cache-service";
import { CustomJwtService } from "./custom-jwt-service";
import { UnitOfWork } from "./unit-of-work";

@Module({
    providers: [UnitOfWork, CustomJwtService, CacheService, AbilityFactory],
    exports: [UnitOfWork, CustomJwtService, CacheService, AbilityFactory],
})
export class CommonModule {}
