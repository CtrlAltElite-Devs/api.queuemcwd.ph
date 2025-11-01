import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { env } from "src/configurations/env/env.config";
import { Admin } from "src/entities/admin.entity";
import { AdminRepository } from "src/repositories/admin.repository";
import { AdminLoginResponseDto } from "./dto/admin-login-response.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { AdminLoginDto } from "./dto/login-admin.dto";

@Injectable()
export class AdminService {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly jwtService: JwtService,
    ) {}

    async CreateAdminAsync(dto: CreateAdminDto) {
        const exists = await this.adminRepository.findOne({ email: dto.email });

        if (exists !== null) {
            throw new BadRequestException("email already exists");
        }

        const saltRounds = await bcrypt.genSalt();

        let hashedPassword = "";

        if (dto.password === undefined) {
            console.log("default admin passwod", env.ADMIN_DEFAULT_PASSWORD);
            hashedPassword = await bcrypt.hash(env.ADMIN_DEFAULT_PASSWORD, saltRounds);
        } else {
            hashedPassword = await bcrypt.hash(dto.password, saltRounds);
        }

        const newAdmin = new Admin();
        newAdmin.email = dto.email;
        newAdmin.password = hashedPassword;
        newAdmin.role = dto.role;

        await this.adminRepository.insert(newAdmin);

        return newAdmin;
    }

    async AdminLoginAsync(body: AdminLoginDto): Promise<AdminLoginResponseDto> {
        const admin = await this.adminRepository.findOne({ email: body.email });

        if (admin === null) {
            throw new UnauthorizedException("Invalid Credentials");
        }

        const isSamePassword = await bcrypt.compare(body.password, admin.password);

        if (!isSamePassword) {
            throw new UnauthorizedException("Invalid Credentials");
        }

        const payload = { sub: admin.id, role: admin.role };
        const dto = new AdminLoginResponseDto();
        dto.accessToken = await this.jwtService.signAsync(payload);
        return dto;
    }
}
