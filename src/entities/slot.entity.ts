import { Collection, Entity, Index, ManyToOne, OneToMany, Opt, Property } from "@mikro-orm/core";
import { CreateSlotDto } from "src/modules/slots/dtos/create-slot.dto";
import { QueueStatus } from "../enums/queue-status.enum";
import { SlotsRepository } from "../repositories/slots.repository";
import { Appointment } from "./appointment.entity";
import { CustomBaseEntity } from "./base.entity";
import { Branch } from "./branch.entity";
import { MonthDay } from "./monthDay.entity";
import { UpdateSlotDto } from "src/modules/slots/dtos/update-slot.dto";

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

    ComputeBooked() {
        return this.appointments.filter(
            (a) => a.queueStatus === QueueStatus.ACTIVE || a.queueStatus === QueueStatus.PENDING,
        ).length;
    }

    ApplyScalarUpdates(dto: UpdateSlotDto) {
        if (dto.isActive !== undefined && dto.isActive !== this.isActive)
            this.isActive = dto.isActive;

        if (dto.limit !== undefined && dto.limit !== this.limit) this.limit = dto.limit;
    }

    static Create(dto: CreateSlotDto, startTime: Date, endTime: Date): Slot {
        const slot = new Slot();
        slot.limit = dto.limit;
        slot.startTime = startTime;
        slot.endTime = endTime;
        return slot;
    }
}
