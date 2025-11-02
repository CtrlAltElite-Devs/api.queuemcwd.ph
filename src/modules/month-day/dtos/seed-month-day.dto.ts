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
}
