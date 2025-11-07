import { BadRequestException } from "@nestjs/common";
import moment from "moment";
import { Slot } from "src/entities/slot.entity";

export type OverlapValidationType = {
    startTime: string;
    endTime: string;
    neighborSlots: Slot[];
    currentSlotId: string;
};

export class SlotValidator {
    static ValidateLimit(limit?: number) {
        if (limit !== undefined && limit <= 0) {
            throw new BadRequestException("limit should be at least 1");
        }
    }

    static ValidateTimeFormatAndOrder(startTime: string, endTime: string) {
        const start = moment(startTime, "HH:mm");
        const end = moment(endTime, "HH:mm");

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

        return { start, end };
    }

    static ValidateNoOverlap(properties: OverlapValidationType) {
        for (const neighbor of properties.neighborSlots) {
            if (neighbor.id === properties.currentSlotId) continue;

            const nStart = moment(neighbor.startTime);
            const nEnd = moment(neighbor.endTime);

            // 🧩 Align dto times to the same date as neighbor slot
            const baseDate = nStart.clone().startOf("day");

            const start = baseDate.clone().set({
                hour: moment(properties.startTime, "HH:mm").hour(),
                minute: moment(properties.startTime, "HH:mm").minute(),
            });

            const end = baseDate.clone().set({
                hour: moment(properties.endTime, "HH:mm").hour(),
                minute: moment(properties.endTime, "HH:mm").minute(),
            });

            const overlaps = start.isBefore(nEnd) && end.isAfter(nStart);

            if (overlaps) {
                throw new BadRequestException(
                    `Time range ${properties.startTime}–${properties.endTime} overlaps with another slot (${nStart.format("HH:mm")} – ${nEnd.format("HH:mm")})`,
                );
            }
        }
    }
}
