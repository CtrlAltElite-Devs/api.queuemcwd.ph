import { Collection, Entity, Index, ManyToOne, OneToMany, Opt, Property } from "@mikro-orm/core";
import { CustomBaseEntity } from "./base.entity";
import { MonthDay } from "./monthDay.entity";
import { Appointment } from "./appointment.entity";
import { SlotsRepository } from "../repositories/slots.repository";

@Entity({ repository: () => SlotsRepository })
@Index({ properties: ["startTime", "endTime"] })
export class Slot extends CustomBaseEntity {
  @Property()
  startTime: Date & Opt = new Date();

  @Property()
  endTime: Date & Opt = new Date();

  @Property({ default: true, index: true })
  isActive: boolean;

  @Property()
  limit: number = 10;

  @ManyToOne(() => MonthDay, { index: true })
  monthDay: MonthDay;

  @OneToMany(() => Appointment, (a) => a.slot)
  appointments = new Collection<Appointment>(this);
}
