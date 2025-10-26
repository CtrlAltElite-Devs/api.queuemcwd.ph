import { Collection, Entity, ManyToOne, OneToMany, Opt, Property } from "@mikro-orm/core";
import { CustomBaseEntity } from "./base.entity";
import { MonthDay } from "./monthDay.entity";
import { Appointment } from "./appointment.entity";

@Entity()
export class Slot extends CustomBaseEntity {

    @Property()
    startTime: Date & Opt = new Date()

    @Property()
    endTime: Date & Opt = new Date()

    @Property({default: true})
    isActive: boolean;

    @Property()
    limit: number = 10;

    @ManyToOne({ entity: () => MonthDay})
    monthDay: MonthDay

    @OneToMany(() => Appointment, a => a.slot)
    appointments = new Collection<Appointment>(this)
}