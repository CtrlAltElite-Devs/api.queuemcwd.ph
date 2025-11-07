import {
    Cascade,
    Collection,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    Property,
} from "@mikro-orm/core";
import moment from "moment";
import { UpdateMonthDayDto } from "src/modules/month-day/dtos/update-month-day.dto";
import { MonthDayRepository } from "../repositories/month-day.repository";
import { CustomBaseEntity } from "./base.entity";
import { Branch } from "./branch.entity";
import { Slot } from "./slot.entity";

@Entity({ repository: () => MonthDayRepository })
@Index({ properties: ["branch", "year", "month"] })
@Index({ properties: ["branch", "year", "month", "day"], options: { unique: true } })
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

    @OneToMany(() => Slot, (slot) => slot.monthDay, {
        cascade: [Cascade.PERSIST],
        orphanRemoval: true,
    })
    slots = new Collection<Slot>(this);

    @ManyToOne(() => Branch)
    branch: Branch;

    ToggleIsWorkingDay() {
        this.isWorkingDay = !this.isWorkingDay;
    }

    ConvertToMoment() {
        return moment({ year: this.year, month: this.month - 1, day: this.day });
    }

    Update(dto: UpdateMonthDayDto) {
        if (dto.isWorkingDay !== undefined) {
            this.isWorkingDay = dto.isWorkingDay;
        }
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
