import { ForbiddenError } from "@casl/ability";
import { Injectable, NotFoundException } from "@nestjs/common";
import { MonthDayKey } from "src/constants/cache.constants";
import { MonthDay } from "src/entities/monthDay.entity";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AbilityFactory, Action } from "src/security/ability/ability.factory";
import { generateSlotsForMonthDay } from "src/utils/generate-month-days.util";
import { AdminDto } from "../admin/dto/admin.dto";
import { AppointmentDto } from "../appointment/dtos/appointment.dto";
import { UnitOfWork } from "../common/unit-of-work";
import { SlotDto } from "../slots/dtos/slot.dto";
import { BatchUpdateMonthDaySlotsDto } from "./dtos/batch-update/batch-update-month-day-slots.dto";
import { MonthDayDto } from "./dtos/month-day.dto";
import { UpdateMonthDayDto } from "./dtos/update-month-day.dto";
import { Slot } from "src/entities/slot.entity";

@Injectable()
export class MonthDayService {
    constructor(
        private readonly slotRepository: SlotsRepository,
        private readonly abilityFactory: AbilityFactory,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async UpdateMonthDay(monthDay: MonthDay, dto: UpdateMonthDayDto) {
        monthDay.Update(dto);
        await this.unitOfWork.Commit({ invalidateKeys: MonthDayKey(monthDay.id) });
        return MonthDayDto.Map(monthDay);
    }

    async EditSlotsForMonthDay(monthDay: MonthDay, options: BatchUpdateMonthDaySlotsDto) {
        options.validateOrThrow();

        const parsedOptions = options.MapToOptionsValue();
        const generatedSlots = generateSlotsForMonthDay(monthDay, parsedOptions);

        // replace slots for monthday entity
        monthDay.slots.set([...generatedSlots]);

        // persist
        await this.unitOfWork.Commit();

        return generatedSlots.map((slot) => {
            const dto = SlotDto.Map(slot);
            dto.dayId = monthDay.id;
            dto.booked = slot.ComputeBooked();
            return dto;
        });
    }

    async GetAppointmentsFromMonthday(admin: AdminDto, monthDayId: string) {
        const slots: Slot[] = await this.slotRepository.findAll({
            where: {
                monthDay: {
                    id: monthDayId,
                },
            },
            populate: ["appointments", "branch"],
        });

        if (slots.length === 0) throw new NotFoundException("month day id not found");

        const abilityForAdmin = this.abilityFactory.defineAbilityForAdmin(admin);
        ForbiddenError.from(abilityForAdmin).throwUnlessCan(Action.Read, slots[0].branch);

        const appointments = slots.flatMap((s) => s.appointments.getItems());
        return appointments.map((a) => AppointmentDto.Map(a));
    }
}
