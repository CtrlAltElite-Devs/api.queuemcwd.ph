import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Admin } from "src/entities/admin.entity";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";

@Module({
    imports: [MikroOrmModule.forFeature([Admin])],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
