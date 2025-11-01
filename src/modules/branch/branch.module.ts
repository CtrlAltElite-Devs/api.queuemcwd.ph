import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Admin } from "src/entities/admin.entity";
import { Branch } from "src/entities/branch.entity";
import { CommonModule } from "../common/common.module";
import { BranchController } from "./branch.controller";
import { BranchService } from "./branch.service";

@Module({
    imports: [MikroOrmModule.forFeature([Branch, Admin]), CommonModule],
    controllers: [BranchController],
    providers: [BranchService],
})
export class BranchModule {}
