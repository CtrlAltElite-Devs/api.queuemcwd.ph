import { BadRequestException, Injectable } from "@nestjs/common";
import moment from "moment";
import { Appointment } from "src/entities/appointment.entity";
import { CategoryCode } from "src/enums/category-code.enum";
import { QueueStatus } from "src/enums/queue-status.enum";
import { AppointmentRepository } from "src/repositories/appointment.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AppointmentDto } from "./dtos/appointment.dto";
import { CreateAppointmentDto } from "./dtos/create-appointment.dto";

@Injectable()
export class AppointmentService {
    constructor(
        private readonly appointmentRepository: AppointmentRepository,
        private readonly slotRepository: SlotsRepository,
    ) {}

    async CreateAppointmentAsync(dto: CreateAppointmentDto): Promise<AppointmentDto> {
        if (dto.age < 18 || dto.age > 99) {
            throw new BadRequestException("age must be between 18 and 99");
        }

        if (dto.age < 60 && dto.category === CategoryCode.SENIOR) {
            throw new BadRequestException("age does not meet the requirement for senior category");
        }

        const slot = await this.slotRepository.findOne(
            { id: dto.slotId },
            { populate: ["monthDay", "appointments"] },
        );

        if (slot === null) throw new BadRequestException("slot id not found");

        if (!slot.monthDay.isWorkingDay) {
            throw new BadRequestException("slot is not on a working day");
        }

        if (moment(slot.endTime).isBefore(moment(), "minute")) {
            throw new BadRequestException("slot has already ended");
        }

        if (!slot.isActive) throw new BadRequestException("slot is not active");

        const now = moment();
        const today = now.clone().startOf("day");
        const slotDate = slot.monthDay.ConvertToMoment();

        if (slotDate.isSame(today, "day")) {
            throw new BadRequestException("you cannot create an appointment for today");
        }

        if (slotDate.isBefore(today, "day")) {
            throw new BadRequestException("slot date has already passed");
        }

        const activeAppointments = slot.appointments
            .getItems()
            .filter(
                (a) =>
                    a.queueStatus === QueueStatus.PENDING || a.queueStatus === QueueStatus.ACTIVE,
            );

        if (activeAppointments.length >= slot.limit) {
            throw new BadRequestException("slot is already full");
        }

        const appointmentCode =
            await this.appointmentRepository.GenerateUniqueAppointmentCodeAsync();

        const newAppointment = new Appointment();
        newAppointment.appointmentCode = appointmentCode;
        newAppointment.age = dto.age;
        newAppointment.categoryCode = dto.category;
        newAppointment.dateValidity = slot.endTime;
        newAppointment.queueStatus = QueueStatus.PENDING;
        newAppointment.slot = slot;

        await this.appointmentRepository.insert(newAppointment);

        return AppointmentDto.Map(newAppointment);
    }

    async VerifyAppointmentAsync(appointmentCode: string): Promise<AppointmentDto> {
        const appointment = await this.appointmentRepository.findOne({
            appointmentCode: appointmentCode,
        });
        if (appointment === null) {
            throw new BadRequestException("appointment code not found");
        }

        return AppointmentDto.Map(appointment);
    }

    // todo add role based authorization
    async UpdateAppointmentStatusAsync(
        appointmentId: string,
        newStatus: QueueStatus,
    ): Promise<AppointmentDto> {
        const appointment = await this.appointmentRepository.findOne(
            { id: appointmentId },
            { populate: ["slot"] },
        );

        if (appointment === null) {
            throw new BadRequestException("Appointment ID not found");
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
