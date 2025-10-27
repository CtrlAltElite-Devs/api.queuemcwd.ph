import { Entity, Property, Unique, Opt, ManyToOne, Enum, Index } from "@mikro-orm/core";
import { CustomBaseEntity } from "./base.entity";
import { Slot } from "./slot.entity";

@Entity()
@Index({ properties: ["dateValidity", "queueStatus"] })
export class Appointment extends CustomBaseEntity {
    @Property()
    @Unique()
    appointmentCode!: string;

    @Property()
    dateValidity: Date & Opt = new Date()

    @Enum()
    @Index()
    categoryCode: CategoryCode

    @Enum()
    @Index() 
    queueStatus: QueueStatus

    @Property()
    age: number

    @ManyToOne({ entity: () => Slot, index: true})
    slot: Slot
}

export enum CategoryCode {
    REGULAR="regular",
    SENIOR="senior",
    PREGNANT="pregnant",
    PWD="pwd"
}

export enum QueueStatus {
    PENDING="pending",
    CANCELLED="cancelled",
    DONE="done"
}