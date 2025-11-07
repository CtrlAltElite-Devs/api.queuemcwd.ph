import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Appointment } from "src/entities/appointment.entity";
import { Slot } from "src/entities/slot.entity";
import { AdminModule } from "../admin/admin.module";
import { CommonModule } from "../common/common.module";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";

@Module({
    imports: [MikroOrmModule.forFeature([Appointment, Slot]), CommonModule, AdminModule],
    controllers: [AppointmentController],
    providers: [AppointmentService],
})
export class AppointmentModule {}
