import { ActivateAppointmentsJob } from "./jobs/appointment-jobs/activate-appointments.job";
import { ExpireAppointmentsJob } from "./jobs/appointment-jobs/expire-appointments.job";
import { MonthDaySeederJob } from "./jobs/seeder-jobs/month-day-seeder-job";
import { DeactivateSlotJob } from "./jobs/slot-jobs/deactivate-slot-job";

export const AllCronJobs = [
    MonthDaySeederJob,
    ActivateAppointmentsJob,
    ExpireAppointmentsJob,
    DeactivateSlotJob,
];
