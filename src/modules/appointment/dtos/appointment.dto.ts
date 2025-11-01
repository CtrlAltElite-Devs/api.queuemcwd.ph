import { ApiProperty } from "@nestjs/swagger";
import { Appointment } from "src/entities/appointment.entity";
import { CategoryCode } from "src/enums/category-code.enum";
import { QueueStatus } from "src/enums/queue-status.enum";
import { BranchDto } from "src/modules/branch/dto/branch.dto";
import { SlotDto } from "src/modules/slots/dtos/slot.dto";

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
    slot: SlotDto;

    @ApiProperty()
    branch: BranchDto;

    static Map(appointment: Appointment): AppointmentDto {
        const dto = new AppointmentDto();
        dto.id = appointment.id;
        dto.appointmentCode = appointment.appointmentCode;
        dto.age = appointment.age;
        dto.categoryCode = appointment.categoryCode;
        dto.dateValidity = appointment.dateValidity;
        dto.queueStatus = appointment.queueStatus;
        dto.slot = SlotDto.Map(appointment.slot);
        dto.branch = BranchDto.Map(appointment.branch);
        return dto;
    }
}
