import moment from "moment";
import { DaysOfWeek, MonthDay } from "../entities/monthDay.entity";
import { Slot } from "../entities/slot.entity";
import { MonthMetaData } from "./get-current-month-data.util";

export type CreateMonthDayOptions = {
  startHour?: number; // 24-hour format
  endHour?: number; // 24-hour format
  incrementMinutes?: number;
};

export type GetDefaultOptionsReturnType = Required<CreateMonthDayOptions>;

export function getDefaultCreateMonthDayOptions(): GetDefaultOptionsReturnType {
  return {
    startHour: 8, // 8 AM
    endHour: 17, // 5 PM
    incrementMinutes: 30, // 30-minute intervals
  };
}

/**
 * Creates an array of MonthDay entities populated with slot entities.
 * Automatically falls back to defaults if options are not provided.
 */
export function createMonthDays(
  monthMetadata: MonthMetaData,
  options: CreateMonthDayOptions = {},
): MonthDay[] {
  const { month, numberOfDays, year } = monthMetadata;
  const { startHour, endHour, incrementMinutes } = {
    ...getDefaultCreateMonthDayOptions(),
    ...options,
  };

  const monthDays: MonthDay[] = [];

  for (let day = 1; day <= numberOfDays; day++) {
    const monthDay = new MonthDay();
    monthDay.month = month;
    monthDay.year = year;
    monthDay.day = day;

    // ✅ Determine day of week
    const dayMoment = moment({ year, month: month - 1, day });
    const dayOfWeekString = dayMoment.format("dddd");
    const dayOfWeek = DaysOfWeek[dayOfWeekString.toUpperCase() as keyof typeof DaysOfWeek];
    monthDay.dayofWeek = dayOfWeek;
    monthDay.isWorkingDay = !(dayOfWeek === DaysOfWeek.SATURDAY || dayOfWeek === DaysOfWeek.SUNDAY);

    const slots: Slot[] = [];

    // ✅ Generate time slots efficiently
    let currentTime = moment({
      year,
      month: month - 1, // moment months are 0-indexed
      day,
      hour: startHour,
      minute: 0,
    });

    const endBoundary = moment({
      year,
      month: month - 1,
      day,
      hour: endHour,
      minute: 0,
    });

    while (currentTime.isBefore(endBoundary) || currentTime.isSame(endBoundary)) {
      const slot = new Slot();
      const startTime = currentTime.clone();
      const endTime = currentTime.clone().add(incrementMinutes, "minutes");

      slot.startTime = startTime.toDate();
      slot.endTime = endTime.toDate();
      slot.monthDay = monthDay;

      // 👇 Automatically deactivate past slots
      const now = moment();
      slot.isActive = endTime.isAfter(now);

      slots.push(slot);
      currentTime = endTime;
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
