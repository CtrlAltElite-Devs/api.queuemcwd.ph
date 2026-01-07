import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { Appointment } from "src/entities/appointment.entity";
import { UseAppointmentGuard, UseBranchGuard } from "src/security/decorators/index.decorators";
import { AppointmentEntity } from "src/security/decorators/queried-entity-decorators/appointment-entity.decorator";
import { AppointmentService } from "./appointment.service";
import { CreateAppointmentDto } from "./dtos/create-appointment.dto";
import { UpdateAppointmentDto } from "./dtos/update-appointment.dto";
import { BranchEntity } from "src/security/decorators/queried-entity-decorators/branch-entity.decorator";
import { Branch } from "src/entities/branch.entity";
import { AppointmentResourceParameter } from "./resource-parameters/appointment-params";

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

    @Get("/:branchId")
    @UseBranchGuard()
    async GetAppointmentsForBranch(
        @Param("branchId", new ParseUUIDPipe()) branchId: string,
        @Query() params: AppointmentResourceParameter,
        @BranchEntity() branch: Branch,
    ) {
        return await this.service.GetAppointmentsForAdmin(branch, params);
    }
}
