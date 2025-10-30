import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dtos/create-appointment.dto";

@Controller("appointments")
export class AppointmentController {
    constructor(private readonly service: AppointmentService) {}

    @Post()    
    async createAppointment(@Body() dto: CreateAppointmentDto) {
        return this.service.CreateAppointmentAsync(dto)
    }

    @Get("verify/:appointmentCode")
    async verifyAppointment(@Param("appointmentCode") appointmentCode: string) {
        return this.service.VerifyAppointmentAsync(appointmentCode);
    }
}