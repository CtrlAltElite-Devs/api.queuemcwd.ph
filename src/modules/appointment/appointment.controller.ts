import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { Appointment } from "src/entities/appointment.entity";
import { UseAppointmentGuard } from "src/security/decorators/index.decorators";
import { AppointmentEntity } from "src/security/decorators/queried-entity-decorators/appointment-entity.decorator";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dtos/create-appointment.dto";
import { UpdateAppointmentDto } from "./dtos/update-appointment.dto";

@Controller("appointments")
export class AppointmentController {
    constructor(private readonly service: AppointmentService) {}

    @Post()
    async createAppointment(@Body() dto: CreateAppointmentDto) {
        return this.service.CreateAppointmentAsync(dto);
    }

    @Get("verify/:appointmentCode")
    async verifyAppointment(@Param("appointmentCode") appointmentCode: string) {
        return this.service.VerifyAppointmentAsync(appointmentCode);
    }

    @Patch("/:appointmentId")
    @UseAppointmentGuard()
    async updateAppointmentStatus(
        @AppointmentEntity() appointment: Appointment,
        @Body() dto: UpdateAppointmentDto,
    ) {
        return this.service.UpdateAppointmentAsync(appointment, dto.queueStatus);
    }
}
