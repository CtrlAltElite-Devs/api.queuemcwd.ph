import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AdminLoginDto {
    @IsEmail()
    @ApiProperty({
        example: "super@gmail.com",
    })
    email: string;

    @IsString()
    @ApiProperty({
        example: "Super123#",
    })
    password: string;
}
