import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class UpdateBranchDto {
    @ApiProperty()
    @IsOptional()
    @IsString()
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    address: string;

    @ApiProperty()
    @IsOptional()
    @IsInt()
    @Min(7, { message: "minimum allowed time frame should be 7" })
    @Max(14, { message: "maximum allowed time frame is 14" })
    allowedTimeFrame: number;

    @ApiPropertyOptional({
        type: [String],
        description: "List of admin user IDs (can be empty or omitted)",
        example: ["d3f9b80b-9a4d-4a5b-95f5-6f2f1c30a789"],
    })
    @IsOptional()
    @IsArray({ message: "adminIds must be an array." })
    adminIds?: string[];
}
