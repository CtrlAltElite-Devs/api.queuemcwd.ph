import { BadRequestException } from "@nestjs/common";
import moment from "moment";
import {
    SLOT_ALREADY_ENDED,
    SLOT_DATE_PASSED,
    SLOT_FULL,
    SLOT_ID_NOT_FOUND,
    SLOT_NOT_ACTIVE,
    SLOT_NOT_ON_WORKING_DAY,
    SLOT_TODAY_NOT_ALLOWED,
    SLOT_TOO_FAR,
} from "src/constants/error-messages/appointment.error";
import { Slot } from "src/entities/slot.entity";
import { QueueStatus } from "src/enums/queue-status.enum";

export class AppointmentValidator {
    static validateSlot(slot: Slot | null): void {
        if (!slot) {
            throw new BadRequestException(SLOT_ID_NOT_FOUND);
        }

        if (!slot.monthDay.isWorkingDay) {
            throw new BadRequestException(SLOT_NOT_ON_WORKING_DAY);
        }

        if (moment(slot.endTime).isBefore(moment(), "minute")) {
            throw new BadRequestException(SLOT_ALREADY_ENDED);
        }

        if (!slot.isActive) {
            throw new BadRequestException(SLOT_NOT_ACTIVE);
        }

        const now = moment();
        const today = now.clone().startOf("day");
        const sevenDaysFromNow = now.clone().add(7, "days").endOf("day");
        const slotDate = slot.monthDay.ConvertToMoment();

        if (slotDate.isSame(today, "day")) {
            throw new BadRequestException(SLOT_TODAY_NOT_ALLOWED);
        }

        if (slotDate.isBefore(today, "day")) {
            throw new BadRequestException(SLOT_DATE_PASSED);
        }

        if (slotDate.isAfter(sevenDaysFromNow, "day")) {
            throw new BadRequestException(SLOT_TOO_FAR);
        }

        const activeAppointments = slot.appointments
            .getItems()
            .filter(
                (a) =>
                    a.queueStatus === QueueStatus.PENDING || a.queueStatus === QueueStatus.ACTIVE,
            );

        if (activeAppointments.length >= slot.limit) {
            throw new BadRequestException(SLOT_FULL);
        }
    }
}
