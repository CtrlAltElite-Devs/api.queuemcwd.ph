import { EntityRepository } from "@mikro-orm/mysql";
import { Appointment } from "src/entities/appointment.entity";
import { generateAppointmentCode } from '../utils/generate-appointment-code';


export class AppointmentRepository extends EntityRepository<Appointment> {
    async generateUniqueAppointmentCode(): Promise<string> {
        for (let i = 0; i < 10; i++) {
            const code = generateAppointmentCode();

            // Check if it already exists in the database
            const existing = await this.findOne({ appointmentCode: code });
            if (!existing) {
                return code;
            }
        }
        throw new Error('Unable to generate unique appointment code after multiple attempts');
    }
}