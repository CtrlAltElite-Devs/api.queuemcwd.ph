import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Admin } from "src/entities/admin.entity";
import { Branch } from "src/entities/branch.entity";
import { AdminModule } from "../admin/admin.module";
import { CommonModule } from "../common/common.module";
import { BranchController } from "./branch.controller";
import { BranchService } from "./branch.service";

@Module({
    imports: [MikroOrmModule.forFeature([Branch, Admin]), CommonModule, AdminModule],
    controllers: [BranchController],
    providers: [BranchService],
})
export class BranchModule {}
