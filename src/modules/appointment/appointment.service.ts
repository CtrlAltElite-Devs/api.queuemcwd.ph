import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Appointment } from "src/entities/appointment.entity";
import { QueueStatus } from "src/enums/queue-status.enum";
import { AppointmentRepository } from "src/repositories/appointment.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AdminDto } from "../admin/dto/admin.dto";
import { UnitOfWork } from "../common/unit-of-work";
import { AppointmentDto } from "./dtos/appointment.dto";
import { CreateAppointmentDto } from "./dtos/create-appointment.dto";
import { AppointmentValidator } from "./validators/appointment.validator";

@Injectable()
export class AppointmentService {
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly slotRepository: SlotsRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async CreateAppointmentAsync(dto: CreateAppointmentDto): Promise<AppointmentDto> {
        const slot = await this.slotRepository.findOne(
            { id: dto.slotId },
            { populate: ["monthDay", "appointments", "branch"] },
        );

        AppointmentValidator.validateSlot(slot);

        const appointmentCode =
            await this.appointmentRepository.GenerateUniqueAppointmentCodeAsync();

        const newAppointment = Appointment.Create(appointmentCode, slot!, dto);
        this.appointmentRepository.create(newAppointment);
        await this.unitOfWork.Commit();
        return AppointmentDto.Map(newAppointment);
    }

    async VerifyAppointmentAsync(appointmentCode: string): Promise<AppointmentDto> {
        const appointment = await this.appointmentRepository.findOne(
            {
                appointmentCode: appointmentCode,
            },
            { populate: ["slot", "branch"] },
        );
        if (appointment === null) {
            throw new BadRequestException("appointment code not found");
        }

        return AppointmentDto.Map(appointment);
    }

    async UpdateAppointmentStatusAsync(
        admin: AdminDto,
        appointmentId: string,
        newStatus: QueueStatus,
    ): Promise<AppointmentDto> {
        const appointment = await this.appointmentRepository.findOne(
            { id: appointmentId },
            { populate: ["slot", "branch"] },
        );

        if (appointment === null) {
            throw new BadRequestException("Appointment ID not found");
        }

        if (appointment.branch.id !== admin.branchId) {
            throw new UnauthorizedException("admin cannot update appointment from another branch");
        }

        const now = new Date();

        // Prevent updating expired appointments
        if (appointment.dateValidity < now) {
            throw new BadRequestException("Cannot update status of an expired appointment");
        }

        // Block updates for terminal statuses
        const terminalStatuses = [QueueStatus.CANCELLED, QueueStatus.EXPIRED, QueueStatus.DONE];

        if (terminalStatuses.includes(appointment.queueStatus)) {
            throw new BadRequestException(
                `Cannot update status of appointment that is ${appointment.queueStatus}`,
            );
        }

        // Validate transition rules
        switch (newStatus) {
            case QueueStatus.DONE:
            case QueueStatus.ARRIVED:
                if (appointment.queueStatus !== QueueStatus.ACTIVE) {
                    throw new BadRequestException("Only active appointments can be marked as done");
                }

                if (!appointment.slot.isActive) {
                    throw new BadRequestException(
                        "Cannot complete appointment for an inactive slot",
                    );
                }

                if (appointment.slot.startTime > now) {
                    throw new BadRequestException(
                        "Cannot complete appointment before the slot start time",
                    );
                }
                break;

            case QueueStatus.CANCELLED:
                if (appointment.queueStatus === QueueStatus.DONE) {
                    throw new BadRequestException("Cannot cancel a completed appointment");
                }
                break;

            default:
                // Optionally handle invalid transitions (if rules evolve later)
                break;
        }

        appointment.queueStatus = newStatus;
        await this.appointmentRepository.getEntityManager().flush();

        return AppointmentDto.Map(appointment);
    }
}
