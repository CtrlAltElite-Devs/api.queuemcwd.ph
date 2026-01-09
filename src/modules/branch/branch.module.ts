import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Admin } from "src/entities/admin.entity";
import { Branch } from "src/entities/branch.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { Slot } from "src/entities/slot.entity";
import { AdminModule } from "../admin/admin.module";
import { CommonModule } from "../common/common.module";
import { BranchController } from "./branch.controller";
import { BranchService } from "./branch.service";
import { Appointment } from "src/entities/appointment.entity";

@Module({
    imports: [
        MikroOrmModule.forFeature([Branch, Admin, MonthDay, Slot, Appointment]),
        CommonModule,
        AdminModule,
    ],
    controllers: [BranchController],
    providers: [BranchService],
})
export class BranchModule {}
