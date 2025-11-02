import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
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

    async GetSlotByIdAsync(slotId: string) {
        const slot = await this.slotRepository.findOne(
            { id: slotId },
            { populate: ["appointments", "monthDay"] },
        );
        if (slot === null) throw new NotFoundException("slot not found");

        const dto = SlotDto.Map(slot);
        dto.booked = slot.appointments.filter(
            (a) => a.queueStatus === QueueStatus.ACTIVE || a.queueStatus === QueueStatus.PENDING,
        ).length;

        return dto;
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
