import { Entity, Index, ManyToOne, Opt, Property, Unique } from "@mikro-orm/core";
import { CategoryCode } from "../enums/category-code.enum";
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
    dateValidity: Date & Opt = new Date();

    @Property()
    @Index()
    categoryCode: CategoryCode;

    @Property()
    @Index()
    queueStatus: QueueStatus;

    @Property()
    age: number;

    @ManyToOne({ entity: () => Slot, index: true })
    slot: Slot;

    @ManyToOne({ entity: () => Branch, index: true })
    branch: Branch;
}
