import { BadRequestException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsPositive, Max, Min } from "class-validator";

export class SeedMonthDayDto {
    @ApiProperty({
        description: "Month number (1–12)",
        example: 10,
    })
    @IsInt({ message: "month must be an integer." })
    @Min(1, { message: "month must be between 1 and 12." })
    @Max(12, { message: "month must be between 1 and 12." })
    month: number;

    @ApiProperty({
        description: "Year number (e.g. 2025)",
        example: 2025,
    })
    @IsInt({ message: "year must be an integer." })
    @IsPositive({ message: "year must be a positive number." })
    @Min(2000, { message: "year must be at least 2000." })
    year: number;

    validateOrThrow() {
        if (this.month < 1 || this.month > 12) {
            throw new BadRequestException("Invalid month: must be between 1 and 12");
        }
        if (this.year < 1970 || this.year > 2100) {
            throw new BadRequestException("Invalid year: must be between 1970 and 2100");
        }
    }
}
