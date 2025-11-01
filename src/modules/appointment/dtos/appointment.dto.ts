import { ApiProperty } from "@nestjs/swagger";
import { Appointment } from "src/entities/appointment.entity";
import { CategoryCode } from "src/enums/category-code.enum";
import { QueueStatus } from "src/enums/queue-status.enum";

export class AppointmentDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    appointmentCode: string;

    @ApiProperty()
    age: number;

    @ApiProperty()
    categoryCode: CategoryCode;

    @ApiProperty()
    dateValidity: Date;

    @ApiProperty()
    queueStatus: QueueStatus;

    @ApiProperty()
    slotId: string;

    static Map(appointment: Appointment): AppointmentDto {
        const dto = new AppointmentDto();
        dto.id = appointment.id;
        dto.appointmentCode = appointment.appointmentCode;
        dto.age = appointment.age;
        dto.categoryCode = appointment.categoryCode;
        dto.dateValidity = appointment.dateValidity;
        dto.queueStatus = appointment.queueStatus;
        dto.slotId = appointment.slot.id;
        return dto;
    }
}
