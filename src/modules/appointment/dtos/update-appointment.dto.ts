import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import { QueueStatus } from "src/enums/queue-status.enum";

const allowedStatusesForUpdate = [
  QueueStatus.ACTIVE,
  QueueStatus.CANCELLED,
  QueueStatus.EXPIRED,
  QueueStatus.DONE,
];
export class UpdateAppointmentDto {
  @ApiProperty({
    enum: allowedStatusesForUpdate,
    description:
      "The new status of the appointment. Allowed values are 'active', 'cancelled', 'expired', and 'done'.",
    example: QueueStatus.ACTIVE,
  })
  @IsIn(allowedStatusesForUpdate)
  status: QueueStatus;
}
