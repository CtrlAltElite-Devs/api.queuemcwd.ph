import { ForbiddenError } from "@casl/ability";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import moment from "moment";
import { SlotKey } from "src/constants/cache.constants";
import { QueueStatus } from "src/enums/queue-status.enum";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AbilityFactory, Action } from "src/security/ability/ability.factory";
import { Slot } from "../../entities/slot.entity";
import { AdminDto } from "../admin/dto/admin.dto";
import { UnitOfWork } from "../common/unit-of-work";
import { CreateSlotDto } from "./dtos/create-slot.dto";
import { SlotDto } from "./dtos/slot.dto";
import { UpdateSlotDto } from "./dtos/update-slot.dto";
import { SlotValidator } from "./validators/slot.validator";
import { wrap } from "@mikro-orm/core";

@Injectable()
export class SlotsService {
    constructor(
        private readonly slotRepository: SlotsRepository,
        private readonly monthDayRepository: MonthDayRepository,
        private readonly unitOfWork: UnitOfWork,
        private readonly abilityFactory: AbilityFactory,
    ) {}

    GetSlotByIdAsync(slot: Slot) {
        const dto = SlotDto.Map(slot);
        dto.booked = slot.appointments.filter(
            (a) => a.queueStatus === QueueStatus.ACTIVE || a.queueStatus === QueueStatus.PENDING,
        ).length;

        return dto;
    }

    async UpdateSlotAsync(slot: Slot, dto: UpdateSlotDto) {
        await this.monthDayRepository.getEntityManager().populate(slot, ["branch", "monthDay"]);

        SlotValidator.ValidateLimit(dto.limit);

        const { startTime, endTime, ...scalarProps } = dto;

        if (startTime && endTime) {
            const neighborSlots = await this.slotRepository.find({
                monthDay: { id: slot.monthDay.id },
            });
            const { validatedStartTime, validatedEndTime } = this.ValidateAndGetSlotTimes(
                startTime,
                endTime,
                neighborSlots,
                slot.id,
                slot.monthDay.ConvertToMoment(),
            );
            slot.startTime = validatedStartTime;
            slot.endTime = validatedEndTime;
        } else if (dto.startTime || dto.endTime) {
            throw new BadRequestException(
                "Both startTime and endTime are required to change slot time",
            );
        }

        wrap(slot).assign(scalarProps, {
            ignoreUndefined: true,
        });

        await this.unitOfWork.Commit({ invalidateKeys: SlotKey(slot.id) });
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

        const adminAbility = this.abilityFactory.defineAbilityForAdmin(admin);
        ForbiddenError.from(adminAbility).throwUnlessCan(Action.Manage, monthDay.branch);

        SlotValidator.ValidateLimit(dto.limit);

        const { validatedStartTime, validatedEndTime } = this.ValidateAndGetSlotTimes(
            dto.startTime,
            dto.endTime,
            [...monthDay.slots],
            "",
            monthDay.ConvertToMoment(),
        );

        const newSlot = Slot.Create(dto, validatedStartTime, validatedEndTime);
        newSlot.monthDay = monthDay;
        newSlot.branch = monthDay.branch;
        this.slotRepository.create(newSlot);
        await this.unitOfWork.Commit();

        return SlotDto.Map(newSlot);
    }

    async DeleteSlot(slot: Slot) {
        slot.SoftDelete();
        await this.unitOfWork.Commit({ invalidateKeys: SlotKey(slot.id) });
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

    private ValidateAndGetSlotTimes(
        startTime: string,
        endTime: string,
        neighborSlots: Slot[],
        currentSlotId: string,
        baseDate: moment.Moment,
    ) {
        SlotValidator.ValidateTimeFormatAndOrder(startTime, endTime);
        SlotValidator.ValidateNoOverlap({
            startTime: startTime,
            endTime: endTime,
            neighborSlots: [...neighborSlots],
            currentSlotId: currentSlotId,
        });

        if (!baseDate.isValid()) {
            throw new BadRequestException("Invalid monthDay date for slot");
        }

        return {
            validatedStartTime: this.ConvertToFullDate(baseDate, startTime),
            validatedEndTime: this.ConvertToFullDate(baseDate, endTime),
        };
    }
}
