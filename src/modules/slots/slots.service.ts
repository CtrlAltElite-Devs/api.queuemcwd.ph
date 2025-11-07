import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import moment from "moment";
import { QueueStatus } from "src/enums/queue-status.enum";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AdminDto } from "../admin/dto/admin.dto";
import { UnitOfWork } from "../common/unit-of-work";
import { SlotDto } from "./dtos/slot.dto";
import { UpdateSlotDto } from "./dtos/update-slot.dto";

@Injectable()
export class SlotsService {
    constructor(
        private readonly slotRepository: SlotsRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async GetSlotByIdAsync(admin: AdminDto, slotId: string) {
        const slot = await this.slotRepository.findOne(
            { id: slotId },
            { populate: ["appointments", "monthDay", "branch"] },
        );
        if (slot === null) throw new NotFoundException("slot not found");
        if (slot.branch.id !== admin.branchId)
            throw new UnauthorizedException("this admin is not assigned to the slot's branch");

        const dto = SlotDto.Map(slot);
        dto.booked = slot.appointments.filter(
            (a) => a.queueStatus === QueueStatus.ACTIVE || a.queueStatus === QueueStatus.PENDING,
        ).length;

        return dto;
    }

    async UpdateSlotAsync(admin: AdminDto, slotId: string, dto: UpdateSlotDto) {
        const slot = await this.slotRepository.findOne(
            { id: slotId },
            { populate: ["branch", "monthDay"] },
        );
        if (!slot) throw new BadRequestException("Slot id not found");

        if (admin.branchId !== slot.branch.id) {
            throw new UnauthorizedException("Admin is not assigned to the slot's branch");
        }

        const neighborSlots = await this.slotRepository.find({
            monthDay: { id: slot.monthDay.id },
        });

        // ✅ Validate start/end times (if provided)
        if (dto.startTime && dto.endTime) {
            const start = moment(dto.startTime, "HH:mm");
            const end = moment(dto.endTime, "HH:mm");

            if (!start.isValid() || !end.isValid()) {
                throw new BadRequestException("Invalid time format (must be HH:mm)");
            }

            if (!start.isBefore(end)) {
                throw new BadRequestException("startTime must be earlier than endTime");
            }

            const diffMinutes = end.diff(start, "minutes");
            if (diffMinutes < 15) {
                throw new BadRequestException("Slot duration must be at least 15 minutes");
            }

            // ✅ Collision detection
            for (const neighbor of neighborSlots) {
                if (neighbor.id === slot.id) continue;

                const nStart = moment(neighbor.startTime, "HH:mm");
                const nEnd = moment(neighbor.endTime, "HH:mm");

                const overlaps = start.isBefore(nEnd) && end.isAfter(nStart);

                if (overlaps) {
                    throw new BadRequestException(
                        `Time range ${dto.startTime}–${dto.endTime} overlaps with another slot (${neighbor.startTime.toISOString()}–${neighbor.endTime.toISOString()})`,
                    );
                }
            }

            // ✅ Convert HH:mm string into Date (keeping the same day as slot.monthDay)
            const baseDate = slot.monthDay.ConvertToMoment();
            if (!baseDate.isValid()) {
                throw new BadRequestException("Invalid monthDay date for slot");
            }

            slot.startTime = moment(dto.startTime, "HH:mm")
                .set({
                    year: baseDate.year(),
                    month: baseDate.month(),
                    date: baseDate.date(),
                })
                .toDate();

            slot.endTime = moment(dto.endTime, "HH:mm")
                .set({
                    year: baseDate.year(),
                    month: baseDate.month(),
                    date: baseDate.date(),
                })
                .toDate();
        } else if (dto.startTime || dto.endTime) {
            // Handle case where only one of them is provided
            throw new BadRequestException(
                "Both startTime and endTime are required to change slot time",
            );
        }

        if (dto.limit !== undefined) slot.limit = dto.limit;
        if (dto.isActive !== undefined) slot.isActive = dto.isActive;

        await this.unitOfWork.Commit();
        return SlotDto.Map(slot);
    }
}
