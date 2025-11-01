import { Entity, Property, Unique, Opt, ManyToOne, Index } from "@mikro-orm/core";
import { CustomBaseEntity } from "./base.entity";
import { Slot } from "./slot.entity";
import { AppointmentRepository } from "../repositories/appointment.repository";
import { CategoryCode } from "../enums/category-code.enum";
import { QueueStatus } from "../enums/queue-status.enum";

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
}
