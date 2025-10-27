import { Cascade, Collection, Entity, Index, OneToMany, Property } from "@mikro-orm/core";
import { CustomBaseEntity } from "./base.entity";
import { Slot } from "./slot.entity";

@Entity()
@Index({properties: ["year", "month"]})
@Index({properties: ["year", "month", "day"]})
export class MonthDay extends CustomBaseEntity {
    @Property()
    month: number;

    @Property()
    year: number;

    @Property()
    day: number;

    @Property()
    dayofWeek: DaysOfWeek;

    @Property({default: true, index: true})
    isWorkingDay: boolean;

    @OneToMany(() => Slot, slot => slot.monthDay, {cascade: [Cascade.PERSIST] })
    slots = new Collection<Slot>(this)
}

export enum DaysOfWeek {
    MONDAY = "monday",
    TUESDAY = "tuesday",
    WEDNESDAY = "wednesday",
    THURSDAY = "thursday",
    FRIDAY = "friday",
    SATURDAY = "saturday",
    SUNDAY = "sunday"
}