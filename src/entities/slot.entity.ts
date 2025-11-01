import { Collection, Entity, Index, ManyToOne, OneToMany, Opt, Property } from "@mikro-orm/core";
import { UpdateSlotDto } from "src/modules/slots/dtos/update-slot.dto";
import { SlotsRepository } from "../repositories/slots.repository";
import { Appointment } from "./appointment.entity";
import { CustomBaseEntity } from "./base.entity";
import { Branch } from "./branch.entity";
import { MonthDay } from "./monthDay.entity";

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
    limit: number = 1;

    @ManyToOne(() => MonthDay, { index: true })
    monthDay: MonthDay;

    @ManyToOne(() => Branch, { index: true })
    branch: Branch;

    @OneToMany(() => Appointment, (a) => a.slot)
    appointments = new Collection<Appointment>(this);

    ToggleIsActive() {
        this.isActive = !this.isActive;
    }

    Update(dto: UpdateSlotDto) {
        if (dto.isActive !== undefined) {
            this.isActive = dto.isActive;
        }

        if (dto.limit !== undefined) {
            this.limit = dto.limit;
        }
    }
}
