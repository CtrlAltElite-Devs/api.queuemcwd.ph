import moment from "moment";
import { Branch } from "src/entities/branch.entity";
import { DaysOfWeek, MonthDay } from "../entities/monthDay.entity";
import { Slot } from "../entities/slot.entity";
import { MonthMetaData } from "./get-current-month-data.util";

export type TimeRange = { startHour: number; endHour: number }; // 24-hour format

export type CreateMonthDayOptions = {
    startHour?: number; // 24-hour format
    endHour?: number; // 24-hour format
    incrementMinutes?: number;
    excludeTimes?: TimeRange[]; // e.g., [{ startHour: 11, endHour: 13 }]
};

export type GetDefaultOptionsReturnType = Required<CreateMonthDayOptions>;

export function getDefaultCreateMonthDayOptions(): GetDefaultOptionsReturnType {
    return {
        startHour: 8, // 8 AM
        endHour: 15, // 3 PM
        incrementMinutes: 60,
        excludeTimes: [
            { startHour: 11, endHour: 12 }, // skip 11AM-12PM
            { startHour: 12, endHour: 13 }, // Lunch break from 12 PM to 1 PM
        ],
    };
}

/**
 * Checks if a given time (moment) falls within any excluded time ranges
 */
function isInExcludedTime(currentTime: moment.Moment, excludeTimes: TimeRange[]): boolean {
    const hour = currentTime.hour();
    return excludeTimes.some((range) => hour >= range.startHour && hour < range.endHour);
}

export function createMonthDays(
    branch: Branch,
    monthMetadata: MonthMetaData,
    options: CreateMonthDayOptions = {},
): MonthDay[] {
    const { month, numberOfDays, year } = monthMetadata;
    const { startHour, endHour, incrementMinutes, excludeTimes } = {
        ...getDefaultCreateMonthDayOptions(),
        ...options,
    };

    const monthDays: MonthDay[] = [];

    for (let day = 1; day <= numberOfDays; day++) {
        const monthDay = new MonthDay();
        monthDay.month = month;
        monthDay.year = year;
        monthDay.day = day;
        monthDay.branch = branch;

        // Determine day of week (UTC)
        const dayMoment = moment.utc({ year, month: month - 1, day });
        const dayOfWeekString = dayMoment.format("dddd");
        const dayOfWeek = DaysOfWeek[dayOfWeekString.toUpperCase() as keyof typeof DaysOfWeek];
        monthDay.dayofWeek = dayOfWeek;
        monthDay.isWorkingDay = !(
            dayOfWeek === DaysOfWeek.SATURDAY || dayOfWeek === DaysOfWeek.SUNDAY
        );

        const slots: Slot[] = [];

        // Generate time slots (UTC)
        const currentTime = moment.utc({ year, month: month - 1, day, hour: startHour, minute: 0 });
        const endBoundary = moment.utc({ year, month: month - 1, day, hour: endHour, minute: 0 });

        while (currentTime.isBefore(endBoundary) || currentTime.isSame(endBoundary)) {
            if (!isInExcludedTime(currentTime, excludeTimes)) {
                const slot = new Slot();
                const startTime = currentTime.clone();
                const endTime = currentTime.clone().add(incrementMinutes, "minutes");

                slot.startTime = startTime.toDate();
                slot.endTime = endTime.toDate();
                slot.monthDay = monthDay;
                slot.branch = branch;

                // Deactivate past slots automatically (UTC)
                slot.isActive = endTime.isAfter(moment.utc());

                slots.push(slot);
            }
            currentTime.add(incrementMinutes, "minutes");
        }

        monthDay.slots.add(slots);
        monthDays.push(monthDay);
    }

    console.log(`✅ Generated ${numberOfDays} days (${month}/${year})`);
    console.log(
        `🕒 Total slots generated: ${monthDays.reduce((sum, md) => sum + md.slots.length, 0)}`,
    );

    return monthDays;
}

export function generateSlotsForMonthDay(
    monthDay: MonthDay,
    options: CreateMonthDayOptions = {},
): Slot[] {
    const { startHour, endHour, incrementMinutes, excludeTimes } = {
        ...getDefaultCreateMonthDayOptions(),
        ...options,
    };

    const { year, month, day, branch } = monthDay;
    const slots: Slot[] = [];

    const currentTime = moment.utc({ year, month: month - 1, day, hour: startHour, minute: 0 });
    const endBoundary = moment.utc({ year, month: month - 1, day, hour: endHour, minute: 0 });

    while (currentTime.isBefore(endBoundary) || currentTime.isSame(endBoundary)) {
        if (!isInExcludedTime(currentTime, excludeTimes)) {
            const slot = new Slot();
            const startTime = currentTime.clone();
            const endTime = currentTime.clone().add(incrementMinutes, "minutes");

            slot.startTime = startTime.toDate();
            slot.endTime = endTime.toDate();
            slot.monthDay = monthDay;
            slot.branch = branch;
            slot.isActive = endTime.isAfter(moment.utc());

            slots.push(slot);
        }

        currentTime.add(incrementMinutes, "minutes");
    }

    monthDay.slots.add(slots);
    return slots;
}
