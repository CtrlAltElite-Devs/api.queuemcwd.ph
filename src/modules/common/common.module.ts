import { Module } from "@nestjs/common";
import { CustomJwtService } from "./custom-jwt-service";
import { UnitOfWork } from "./unit-of-work";

@Module({
    providers: [UnitOfWork, CustomJwtService],
    exports: [UnitOfWork, CustomJwtService],
})
export class CommonModule {}
