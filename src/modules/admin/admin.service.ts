import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { env } from "src/configurations/env/env.config";
import { AdminCacheTTL, AdminKey } from "src/constants/cache.constants";
import { Admin } from "src/entities/admin.entity";
import { Branch } from "src/entities/branch.entity";
import { AdminRepository } from "src/repositories/admin.repository";
import { BranchRepository } from "src/repositories/branch.repository";
import { CacheService } from "../common/cache-service";
import { CustomJwtService } from "../common/custom-jwt-service";
import { JwtPayloadDto } from "../common/dto/jwt-payload.dto";
import { UnitOfWork } from "../common/unit-of-work";
import { AdminLoginResponseDto } from "./dto/admin-login-response.dto";
import { AdminDto } from "./dto/admin.dto";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { AdminLoginDto } from "./dto/login-admin.dto";

@Injectable()
export class AdminService {
    constructor(
        private readonly adminRepository: AdminRepository,
        private readonly branchRepository: BranchRepository,
        private readonly jwtService: CustomJwtService,
        private readonly unitOfWork: UnitOfWork,
        private readonly cacheService: CacheService,
    ) {}

    async CreateAdminAsync(dto: CreateAdminDto): Promise<AdminDto> {
        const exists = await this.adminRepository.findOne({ email: dto.email });

        if (exists !== null) {
            throw new BadRequestException("email already exists");
        }

        let branch: Branch | undefined = undefined;

        if (dto.branchId !== undefined) {
            const existingBranch = await this.branchRepository.findOne({ id: dto.branchId });
            if (existingBranch === null) {
                throw new BadRequestException("branch Id does not exist");
            }
            branch = existingBranch;
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
        newAdmin.branch = branch;

        this.adminRepository.create(newAdmin);
        await this.unitOfWork.Commit();

        return AdminDto.Map(newAdmin);
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

        const signedTokens = await this.jwtService.CreateSignedTokens(
            JwtPayloadDto.Create(admin.id),
        );
        return {
            accessToken: signedTokens.accessToken,
        };
    }

    async GetAdminByIdForGuard(adminId: string) {
        return await this.cacheService.GetOrCreate(AdminKey(adminId), {
            getFunc: () => this.RetrieveAdminDto(adminId),
            ttl: AdminCacheTTL,
        });
    }

    private async RetrieveAdminDto(adminId: string): Promise<AdminDto | null> {
        const admin = await this.adminRepository.findOne(
            {
                id: adminId,
            },
            { populate: ["branch"] },
        );

        if (admin === null) return null;

        return AdminDto.Map(admin);
    }

    async Me(adminId: string) {
        const admin = await this.adminRepository.findOne(
            {
                id: adminId,
            },
            { populate: ["branch"] },
        );

        if (admin !== null) throw new UnauthorizedException("admin not found");

        return admin;
    }
}
