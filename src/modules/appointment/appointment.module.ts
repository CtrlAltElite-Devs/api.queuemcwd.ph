import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";
import { Appointment } from "src/entities/appointment.entity";
import { AppointmentController } from "./appointment.controller";
import { AppointmentService } from "./appointment.service";
import { Slot } from "src/entities/slot.entity";

@Module({
    imports: [MikroOrmModule.forFeature([Appointment, Slot])],
    controllers: [AppointmentController],
    providers: [AppointmentService]
})
export class AppointmentModule {}