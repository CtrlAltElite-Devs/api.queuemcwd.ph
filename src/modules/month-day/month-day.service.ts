import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { generateSlotsForMonthDay } from "src/utils/generate-month-days.util";
import { AdminDto } from "../admin/dto/admin.dto";
import { UnitOfWork } from "../common/unit-of-work";
import { SlotDto } from "../slots/dtos/slot.dto";
import { BatchUpdateMonthDaySlotsDto } from "./dtos/batch-update/batch-update-month-day-slots.dto";
import { MonthDayDto } from "./dtos/month-day.dto";
import { UpdateMonthDayDto } from "./dtos/update-month-day.dto";

@Injectable()
export class MonthDayService {
    constructor(
        private readonly monthDayRepository: MonthDayRepository,
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
        if (monthDay.branch.id !== admin.branchId)
            throw new UnauthorizedException("this admin does not handle this branch");

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

        if (monthDay.branch.id !== admin.branchId)
            throw new UnauthorizedException("this admin is not assigned to the monthday's branch");

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

        if (admin.branchId !== monthDay.branch.id) {
            throw new UnauthorizedException("Admin cannot manage this month day");
        }

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
}
