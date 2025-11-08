import { Entity, Index, ManyToOne, Opt, Property, Unique } from "@mikro-orm/core";
import { CreateAppointmentDto } from "src/modules/appointment/dtos/create-appointment.dto";
import { AppointmentType } from "../enums/appointment-type.enum";
import { QueueStatus } from "../enums/queue-status.enum";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { CustomBaseEntity } from "./base.entity";
import { Branch } from "./branch.entity";
import { Slot } from "./slot.entity";

@Entity({ repository: () => AppointmentRepository })
@Index({ properties: ["queueStatus", "dateValidity"] })
export class Appointment extends CustomBaseEntity {
    @Property()
    @Unique()
    appointmentCode!: string;

    @Property()
    accountCode!: string;

    @Property()
    contactPerson!: string;

    @Property()
    contact!: string;

    @Property()
    dateValidity: Date & Opt = new Date();

    @Property()
    @Index()
    queueStatus: QueueStatus;

    @Property()
    @Index()
    appointmentType: AppointmentType;

    @ManyToOne({ entity: () => Slot, index: true })
    slot: Slot;

    @ManyToOne({ entity: () => Branch, index: true })
    branch: Branch;

    static Create(code: string, slot: Slot, dto: CreateAppointmentDto): Appointment {
        const newAppointment = new Appointment();
        newAppointment.accountCode = dto.accountCode;
        newAppointment.contactPerson = dto.contactPerson;
        newAppointment.contact = dto.contact;
        newAppointment.queueStatus = QueueStatus.PENDING;
        newAppointment.appointmentType = dto.appointmentType;
        newAppointment.queueStatus = QueueStatus.PENDING;

        newAppointment.appointmentCode = code;
        newAppointment.dateValidity = slot.endTime;
        newAppointment.slot = slot;
        newAppointment.branch = slot.branch;
        return newAppointment;
    }
}
