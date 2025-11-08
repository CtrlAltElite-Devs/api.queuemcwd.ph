import { ApiProperty } from "@nestjs/swagger";
import { Appointment } from "src/entities/appointment.entity";
import { AppointmentType } from "src/enums/appointment-type.enum";
import { QueueStatus } from "src/enums/queue-status.enum";
import { BranchDto } from "src/modules/branch/dto/branch.dto";
import { SlotDto } from "src/modules/slots/dtos/slot.dto";

export class AppointmentDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    appointmentCode: string;

    @ApiProperty()
    accountCode: string;

    @ApiProperty()
    contactPerson: string;

    @ApiProperty()
    contact: string;

    @ApiProperty()
    dateValidity: Date;

    @ApiProperty()
    queueStatus: QueueStatus;

    @ApiProperty()
    appointmentType: AppointmentType;

    @ApiProperty()
    slot: SlotDto;

    @ApiProperty()
    branch: BranchDto;

    static Map(appointment: Appointment): AppointmentDto {
        const dto = new AppointmentDto();
        dto.id = appointment.id;
        dto.accountCode = appointment.accountCode;
        dto.contactPerson = appointment.contactPerson;
        dto.contact = appointment.contact;
        dto.appointmentCode = appointment.appointmentCode;
        dto.dateValidity = appointment.dateValidity;
        dto.queueStatus = appointment.queueStatus;
        dto.appointmentType = appointment.appointmentType;
        dto.slot = SlotDto.Map(appointment.slot);
        dto.branch = BranchDto.Map(appointment.branch);
        return dto;
    }
}
