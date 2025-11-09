import { BadRequestException } from "@nestjs/common";
import moment from "moment";
import { SLOT_TOO_FAR, SlotErrors } from "src/constants/error-messages/appointment.error";
import { Slot } from "src/entities/slot.entity";
import { QueueStatus } from "src/enums/queue-status.enum";

function addWorkingDays(date: moment.Moment, days: number): moment.Moment {
    const result = date.clone();
    while (days > 0) {
        result.add(1, "day");
        const day = result.isoWeekday(); // 6 = Saturday, 7 = Sunday
        if (day !== 6 && day !== 7) {
            days--;
        }
    }
    return result.endOf("day");
}

export class AppointmentValidator {
    static validateSlot(slot: Slot | null): void {
        if (!slot) {
            throw new BadRequestException(SlotErrors.SLOT_ID_NOT_FOUND);
        }

        if (!slot.monthDay.isWorkingDay) {
            throw new BadRequestException(SlotErrors.SLOT_NOT_ON_WORKING_DAY);
        }

        if (moment(slot.endTime).isBefore(moment(), "minute")) {
            throw new BadRequestException(SlotErrors.SLOT_ALREADY_ENDED);
        }

        if (!slot.isActive) {
            throw new BadRequestException(SlotErrors.SLOT_NOT_ACTIVE);
        }

        const now = moment();
        const today = now.clone().startOf("day");
        const allowedTimeFrame = addWorkingDays(now, slot.branch.allowedTimeFrame);
        const slotDate = slot.monthDay.ConvertToMoment();

        if (slotDate.isSame(today, "day")) {
            throw new BadRequestException(SlotErrors.SLOT_TODAY_NOT_ALLOWED);
        }

        if (slotDate.isBefore(today, "day")) {
            throw new BadRequestException(SlotErrors.SLOT_DATE_PASSED);
        }

        if (slotDate.isAfter(allowedTimeFrame, "day")) {
            throw new BadRequestException(SLOT_TOO_FAR(slot.branch.allowedTimeFrame));
        }

        const activeAppointments = slot.appointments
            .getItems()
            .filter(
                (a) =>
                    a.queueStatus === QueueStatus.PENDING || a.queueStatus === QueueStatus.ACTIVE,
            );

        if (activeAppointments.length >= slot.limit) {
            throw new BadRequestException(SlotErrors.SLOT_FULL);
        }
    }
}
