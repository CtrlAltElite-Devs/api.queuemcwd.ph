import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import type { AuthenticatedRequest } from "src/security/common/authenticated.request";
import { UseAdminOnlyGuard } from "src/security/decorators/index.decorators";
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
    @UseAdminOnlyGuard()
    async updateAppointmentStatus(
        @Req() request: AuthenticatedRequest,
        @Param("appointmentId") appointmentId: string,
        @Body() dto: UpdateAppointmentDto,
    ) {
        return this.service.UpdateAppointmentStatusAsync(
            request.admin!,
            appointmentId,
            dto.queueStatus,
        );
    }
}
