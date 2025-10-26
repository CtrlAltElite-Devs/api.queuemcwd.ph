import { Collection, Entity, OneToMany, Property } from "@mikro-orm/core";
import { CustomBaseEntity } from "./base.entity";
import { Slot } from "./slot.entity";

@Entity()
export class MonthDay extends CustomBaseEntity {
    @Property()
    month: number;
    
    @Property()
    year: number;

    @Property({default: true})
    isWorkingDay: boolean;

    @OneToMany(() => Slot, slot => slot.monthDay)
    slots = new Collection<Slot>(this)
}