import { Cascade, Collection, Entity, Index, OneToMany, Property } from "@mikro-orm/core";
import moment from "moment";
import { MonthDayRepository } from "../repositories/month-day.repository";
import { CustomBaseEntity } from "./base.entity";
import { Slot } from "./slot.entity";

@Entity({ repository: () => MonthDayRepository })
@Index({ properties: ["year", "month"] })
@Index({ properties: ["year", "month", "day"] })
export class MonthDay extends CustomBaseEntity {
    @Property()
    month: number;

    @Property()
    year: number;

    @Property()
    day: number;

    @Property()
    dayofWeek: DaysOfWeek;

    @Property({ default: true, index: true })
    isWorkingDay: boolean;

    @OneToMany(() => Slot, (slot) => slot.monthDay, { cascade: [Cascade.PERSIST] })
    slots = new Collection<Slot>(this);

    ConvertToMoment() {
        return moment({ year: this.year, month: this.month - 1, day: this.day });
    }
}

export enum DaysOfWeek {
    MONDAY = "monday",
    TUESDAY = "tuesday",
    WEDNESDAY = "wednesday",
    THURSDAY = "thursday",
    FRIDAY = "friday",
    SATURDAY = "saturday",
    SUNDAY = "sunday",
}
