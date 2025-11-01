import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateBranchDto {
    @ApiProperty({ example: "Main Branch" })
    @IsString()
    @IsNotEmpty({ message: "Branch name is required." })
    name: string;

    @ApiProperty({ example: "BR001" })
    @IsString()
    @Length(2, 10, { message: "Branch code must be between 2 and 10 characters." })
    branchCode: string;

    @ApiProperty({ example: "123 Main Street, Cityville" })
    @IsString()
    @IsNotEmpty({ message: "Address is required." })
    address: string;

    @ApiPropertyOptional({
        type: [String],
        description: "List of admin user IDs (can be empty or omitted)",
        example: ["d3f9b80b-9a4d-4a5b-95f5-6f2f1c30a789"],
    })
    @IsOptional()
    @IsArray({ message: "adminIds must be an array." })
    adminIds?: string[];
}
