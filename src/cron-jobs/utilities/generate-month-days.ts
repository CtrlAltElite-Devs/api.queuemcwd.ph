import moment from "moment";
import { CurrentMonthMetaData } from "./get-current-month-data";
import { DaysOfWeek, MonthDay } from '../../entities/monthDay.entity';
import { Slot } from '../../entities/slot.entity';

export function createMonthDays(cm: CurrentMonthMetaData) : MonthDay[] {
        const {month, numberOfDays, year} = cm;
        const monthDays: MonthDay[] = [];
        const startHour = 8;  // 8 AM
        const endHour = 17;   // 5 PM
        const increment = 30; // minutes

        for (let day = 1; day <= numberOfDays; day++) {
            const monthDay = new MonthDay();
            monthDay.month = month;
            monthDay.year = year;
            monthDay.day = day;
            
            // ✅ Get day of the week (e.g., "Monday")
            const dayMoment = moment({ year, month: month - 1, day });
            const dayofWeekString = dayMoment.format('dddd'); // "Monday"
            const dayOfWeek = DaysOfWeek[dayofWeekString.toUpperCase() as keyof typeof DaysOfWeek];
            monthDay.dayofWeek = dayOfWeek;

            const slots: Slot[] = [];

            // Start from 8:00 AM for this day
            let currentTime = moment({
                year,
                month: month - 1, // moment months are 0-indexed
                day,
                hour: startHour,
                minute: 0
            });

            // Create slots from 8:00 AM to 5:30 PM
            while (currentTime.hour() < endHour || (currentTime.hour() === endHour && currentTime.minute() === 0)) {
                const slot = new Slot();

                const startTime = currentTime.clone();
                const endTime = currentTime.clone().add(increment, "minutes");

                slot.startTime = startTime.toDate();
                slot.endTime = endTime.toDate();
                slot.monthDay = monthDay; // ✅ set the relation

                slots.push(slot);
                currentTime = endTime;
            }

            monthDay.slots.add(slots);
            monthDays.push(monthDay);
        }
        console.log("Number of days:", numberOfDays);
        console.log("Total slots generated:", monthDays.reduce((sum, md) => sum + md.slots.length, 0)); 
        return monthDays;
    }