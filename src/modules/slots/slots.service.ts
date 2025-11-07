import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import moment from "moment";
import { QueueStatus } from "src/enums/queue-status.enum";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { Slot } from "../../entities/slot.entity";
import { AdminDto } from "../admin/dto/admin.dto";
import { UnitOfWork } from "../common/unit-of-work";
import { CreateSlotDto } from "./dtos/create-slot.dto";
import { SlotDto } from "./dtos/slot.dto";
import { UpdateSlotDto } from "./dtos/update-slot.dto";
import { SlotValidator } from "./validators/slot.validator";

@Injectable()
export class SlotsService {
    constructor(
        private readonly slotRepository: SlotsRepository,
        private readonly monthDayRepository: MonthDayRepository,
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

        SlotValidator.ValidateLimit(dto.limit);

        const neighborSlots = await this.slotRepository.find({
            monthDay: { id: slot.monthDay.id },
        });

        if (dto.startTime && dto.endTime) {
            SlotValidator.ValidateTimeFormatAndOrder(dto.startTime, dto.endTime);
            SlotValidator.ValidateNoOverlap({
                startTime: dto.startTime,
                endTime: dto.endTime,
                neighborSlots: neighborSlots,
                currentSlotId: slotId,
            });

            const baseDate = slot.monthDay.ConvertToMoment();
            if (!baseDate.isValid()) {
                throw new BadRequestException("Invalid monthDay date for slot");
            }

            slot.startTime = this.ConvertToFullDate(baseDate, dto.startTime);
            slot.endTime = this.ConvertToFullDate(baseDate, dto.endTime);
        } else if (dto.startTime || dto.endTime) {
            throw new BadRequestException(
                "Both startTime and endTime are required to change slot time",
            );
        }

        if (dto.limit !== undefined) slot.limit = dto.limit;
        if (dto.isActive !== undefined) slot.isActive = dto.isActive;

        await this.unitOfWork.Commit();
        return SlotDto.Map(slot);
    }

    async CreateSlot(admin: AdminDto, dto: CreateSlotDto) {
        const monthDay = await this.monthDayRepository.findOne(
            {
                id: dto.monthDayId,
            },
            { populate: ["slots", "branch"] },
        );

        if (monthDay === null) throw new NotFoundException("Month day not found");

        if (monthDay.branch.id !== admin.branchId) {
            throw new UnauthorizedException("Admin is not assigned to this branch");
        }

        SlotValidator.ValidateLimit(dto.limit);

        const slots = monthDay.slots;

        SlotValidator.ValidateTimeFormatAndOrder(dto.startTime, dto.endTime);
        SlotValidator.ValidateNoOverlap({
            startTime: dto.startTime,
            endTime: dto.endTime,
            neighborSlots: [...slots],
            currentSlotId: "",
        });

        const baseDate = monthDay.ConvertToMoment();
        if (!baseDate.isValid()) {
            throw new BadRequestException("Invalid monthDay date for slot");
        }

        const validatedStartTime = this.ConvertToFullDate(baseDate, dto.startTime);
        const validatedEndTime = this.ConvertToFullDate(baseDate, dto.endTime);

        const newSlot = Slot.Create(dto, validatedStartTime, validatedEndTime);
        newSlot.monthDay = monthDay;
        newSlot.branch = monthDay.branch;
        this.slotRepository.create(newSlot);
        await this.unitOfWork.Commit();

        return SlotDto.Map(newSlot);
    }

    async DeleteSlot(admin: AdminDto, slotId: string) {
        const slot = await this.slotRepository.findOne(
            {
                id: slotId,
            },
            { populate: ["branch"] },
        );

        if (slot === null) throw new NotFoundException("Slot not found");

        if (slot.branch.id !== admin.branchId)
            throw new UnauthorizedException("Admin is not under this branch");

        slot.SoftDelete();

        await this.unitOfWork.Commit();

        return {
            message: `Slot: ${slot.id} was deleted`,
        };
    }

    private ConvertToFullDate(baseDate: moment.Moment, time: string): Date {
        return moment(time, "HH:mm")
            .set({
                year: baseDate.year(),
                month: baseDate.month(),
                date: baseDate.date(),
            })
            .toDate();
    }
}
