import { BadRequestException, Injectable } from "@nestjs/common";
import { AppointmentRepository } from "src/repositories/appointment.repository";
import { CreateAppointmentDto } from "./dtos/create-appointment.dto";
import { SlotsRepository } from "src/repositories/slots.repository";
import { Appointment} from "src/entities/appointment.entity";
import { CategoryCode } from "src/enums/category-code.enum";
import { QueueStatus } from "src/enums/queue-status.enum";
import { AppointmentDto } from "./dtos/appointment.dto";

@Injectable()
export class AppointmentService {
    constructor(
        private readonly appointmentRepository : AppointmentRepository,
        private readonly slotRepository: SlotsRepository
    ) {}

    async CreateAppointmentAsync(dto: CreateAppointmentDto) : Promise<AppointmentDto> {
        if(dto.age < 18 || dto.age > 99){
            throw new BadRequestException("age must be between 18 and 99");
        }

        if(dto.age < 60 && dto.category === CategoryCode.SENIOR){
            throw new BadRequestException("age does not meet the requirement for senior category");
        }
        
        const slot = await this.slotRepository.findOne({id: dto.slotId}, {populate: ["monthDay", "appointments"]})

        if(slot === null)
            throw new BadRequestException("slot id not found");

        if(slot.isActive === false)
            throw new BadRequestException("slot is not active");

        if(slot.appointments.length >= slot.limit){
            throw new BadRequestException("slot is already full");
        }


        const appointmentCode = await this.appointmentRepository.GenerateUniqueAppointmentCodeAsync();

        const validUntilDate = new Date(
            slot.startTime.getTime() + (8 * 60 + 30) * 60000
        );

        const newAppointment = new Appointment();
        newAppointment.appointmentCode = appointmentCode;
        newAppointment.age = dto.age;
        newAppointment.categoryCode = dto.category;
        newAppointment.dateValidity = validUntilDate;
        newAppointment.queueStatus = QueueStatus.PENDING;
        newAppointment.slot = slot;
        await this.appointmentRepository.insert(newAppointment);

        return AppointmentDto.Map(newAppointment);
    }

    async VerifyAppointmentAsync(appointmentCode: string) : Promise<AppointmentDto> {
        const appointment = await this.appointmentRepository.findOne({appointmentCode: appointmentCode});
        if(appointment === null){
            throw new BadRequestException("appointment code not found");
        }

        const status = appointment.queueStatus;

        if(status !== QueueStatus.ACTIVE){
            throw new BadRequestException(`appointment is not active. current status: ${status}`);
        }

        if(appointment.dateValidity < new Date()){
            throw new BadRequestException("appointment is already expired");
        }

        return AppointmentDto.Map(appointment);
    }

    // todo add role based authorization
    async UpdateAppointmentStatusAsync(appointmentId: string, status: QueueStatus) : Promise<AppointmentDto> {
        const appointment = await this.appointmentRepository.findOne({id: appointmentId});
        if(appointment === null){
            throw new BadRequestException("appointment id not found");
        }

        appointment.queueStatus = status;
        await this.appointmentRepository.getEntityManager().flush();

        return AppointmentDto.Map(appointment);
    }
}