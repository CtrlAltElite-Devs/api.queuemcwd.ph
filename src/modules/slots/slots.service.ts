import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { QueueStatus } from "src/enums/queue-status.enum";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AdminDto } from "../admin/dto/admin.dto";
import { UnitOfWork } from "../common/unit-of-work";
import { SlotDto } from "./dtos/slot.dto";
import { UpdateSlotDto } from "./dtos/update-slot.dto";

@Injectable()
export class SlotsService {
    constructor(
        private readonly slotRepository: SlotsRepository,
        private readonly monthDayRepository: MonthDayRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async GetSlotsForMonthDayByIdAsync(monthDayId: string): Promise<SlotDto[]> {
        const monthDay = await this.monthDayRepository.findOne(
            { id: monthDayId },
            { fields: ["id", "isWorkingDay"] },
        );

        if (monthDay === null) {
            throw new BadRequestException("Month Day ID not found");
        }

        if (!monthDay.isWorkingDay) {
            throw new BadRequestException("Month Day is not a working day");
        }

        const slots = await this.slotRepository.findAll({
            where: {
                monthDay: { id: monthDayId },
            },
            orderBy: { startTime: "ASC" },
            populate: ["appointments"],
        });

        return slots.map((slot) => {
            const dto = new SlotDto();
            dto.id = slot.id;
            dto.dayId = monthDayId;
            dto.startTime = slot.startTime;
            dto.endTime = slot.endTime;
            dto.maxCapacity = slot.limit;
            dto.isActive = slot.isActive;
            dto.booked = slot.appointments.filter(
                (a) =>
                    a.queueStatus === QueueStatus.ACTIVE || a.queueStatus === QueueStatus.PENDING,
            ).length;
            return dto;
        });
    }

    async UpdateSlotAsync(admin: AdminDto, slotId: string, dto: UpdateSlotDto) {
        const slot = await this.slotRepository.findOne({ id: slotId }, { populate: ["branch"] });
        if (slot === null) throw new BadRequestException("Slot id not found");
        if (admin.branchId !== slot?.branch.id) {
            throw new UnauthorizedException("admin is not assigned to the slot's branch");
        }
        slot.Update(dto);
        await this.unitOfWork.Commit();
        return SlotDto.Map(slot);
    }
}
