import { ActivateAppointmentsJob } from "./jobs/activate-appointments.job";
import { ExpireAppointmentsJob } from "./jobs/expire-appointments.job";
import { MonthDaySeederJob } from './jobs/month-day-seeder-job';

export const cronJobs = [ MonthDaySeederJob, ActivateAppointmentsJob, ExpireAppointmentsJob ]