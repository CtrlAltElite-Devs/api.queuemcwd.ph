import { Appointment } from "src/entities/appointment.entity";
import { Branch } from "src/entities/branch.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { Slot } from "src/entities/slot.entity";
import { AuthenticatedRequest } from "./authenticated.request";

export interface EnrichedRequest extends AuthenticatedRequest {
    branch?: Branch;
    monthDay?: MonthDay;
    slot?: Slot;
    appointment?: Appointment;
}
