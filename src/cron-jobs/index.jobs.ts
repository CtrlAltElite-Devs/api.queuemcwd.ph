import { ActivateAppointmentsJob } from "./jobs/appointment-jobs/activate-appointments.job";
import { DeactivateSlotJob } from "./jobs/appointment-jobs/deactivate-slot-job";
import { ExpireAppointmentsJob } from "./jobs/appointment-jobs/expire-appointments.job";
import { MonthDaySeederJob } from "./jobs/seeder-jobs/month-day-seeder-job";

export const cronJobs = [
  MonthDaySeederJob,
  ActivateAppointmentsJob,
  ExpireAppointmentsJob,
  DeactivateSlotJob,
];
