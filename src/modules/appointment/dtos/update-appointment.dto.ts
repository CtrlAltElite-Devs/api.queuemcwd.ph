import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { QueueStatus } from "src/enums/queue-status.enum";

export class UpdateAppointmentDto{

    @ApiProperty()
    @IsEnum(QueueStatus)
    status: QueueStatus;
}