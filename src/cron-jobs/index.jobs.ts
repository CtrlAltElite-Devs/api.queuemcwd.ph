import { ActivateAppointmentsJob } from "./activate-appointments.job";
import { ExpireAppointmentsJob } from "./expire-appointments.job";
import { MonthDaySeederJob } from './month-day-seeder-job';

export const cronJobs = [ MonthDaySeederJob, ActivateAppointmentsJob, ExpireAppointmentsJob ]