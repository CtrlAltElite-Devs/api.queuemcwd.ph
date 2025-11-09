import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { generateSlotsForMonthDay } from "src/utils/generate-month-days.util";
import { AdminDto } from "../admin/dto/admin.dto";
import { AppointmentDto } from "../appointment/dtos/appointment.dto";
import { UnitOfWork } from "../common/unit-of-work";
import { BranchAdminValidator } from "../common/validators/branch-admin.validator";
import { SlotDto } from "../slots/dtos/slot.dto";
import { BatchUpdateMonthDaySlotsDto } from "./dtos/batch-update/batch-update-month-day-slots.dto";
import { MonthDayDto } from "./dtos/month-day.dto";
import { UpdateMonthDayDto } from "./dtos/update-month-day.dto";

@Injectable()
export class MonthDayService {
    constructor(
        private readonly monthDayRepository: MonthDayRepository,
        private readonly slotRepository: SlotsRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async GetMonthDayById(admin: AdminDto, monthDayId: string) {
        const monthDay = await this.monthDayRepository.findOne(
            {
                id: monthDayId,
            },
            { populate: ["branch"] },
        );
        if (monthDay === null) throw new NotFoundException("monthday not found");

        BranchAdminValidator.EnsureIsAssignedToBranch(admin, monthDay.branch);

        return MonthDayDto.Map(monthDay);
    }

    async UpdateMonthDay(admin: AdminDto, monthDayId: string, dto: UpdateMonthDayDto) {
        const monthDay = await this.monthDayRepository.findOne(
            { id: monthDayId },
            { populate: ["branch"] },
        );
        if (monthDay === null) {
            throw new BadRequestException("Month Day not found");
        }

        BranchAdminValidator.EnsureIsAssignedToBranch(admin, monthDay.branch);

        monthDay.Update(dto);
        await this.unitOfWork.Commit();
        return MonthDayDto.Map(monthDay);
    }

    async EditSlotsForMonthDay(
        admin: AdminDto,
        monthDayId: string,
        options: BatchUpdateMonthDaySlotsDto,
    ) {
        options.validateOrThrow();

        const monthDay = await this.monthDayRepository.findOne(
            { id: monthDayId },
            { populate: ["branch"] },
        );

        if (monthDay === null) {
            throw new NotFoundException("Month day not found");
        }

        BranchAdminValidator.EnsureIsAssignedToBranch(admin, monthDay.branch);

        const parsedOptions = options.MapToOptionsValue();
        const generatedSlots = generateSlotsForMonthDay(monthDay, parsedOptions);

        // replace slots for monthday entity
        monthDay.slots.set([...generatedSlots]);

        // persist
        await this.unitOfWork.Commit();

        return generatedSlots.map((slot) => {
            const dto = SlotDto.Map(slot);
            dto.dayId = monthDayId;
            dto.booked = slot.ComputeBooked();
            return dto;
        });
    }

    async GetAppointmentsFromMonthday(admin: AdminDto, monthDayId: string) {
        const slots = await this.slotRepository.findAll({
            where: {
                monthDay: {
                    id: monthDayId,
                },
            },
            populate: ["appointments", "branch"],
        });

        if (slots.length === 0) throw new NotFoundException("month day id not found");

        BranchAdminValidator.EnsureIsAssignedToBranch(admin, slots[0].branch);

        const appointments = slots.flatMap((s) => s.appointments.getItems());
        return appointments.map((a) => AppointmentDto.Map(a));
    }
}
