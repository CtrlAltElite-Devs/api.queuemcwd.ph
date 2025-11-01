import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNumber, IsUUID } from "class-validator";
import { CategoryCode } from "src/enums/category-code.enum";

export class CreateAppointmentDto {
    @ApiProperty()
    @IsUUID()
    slotId: string;

    @ApiProperty()
    @IsEnum(CategoryCode)
    category: CategoryCode;

    @ApiProperty()
    @IsNumber()
    age: number;
}
