import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { Admin } from "src/entities/admin.entity";
import { Branch } from "src/entities/branch.entity";
import { AdminService } from "src/modules/admin/admin.service";
import { CreateAdminDto } from "src/modules/admin/dto/create-admin.dto";
import { AdminLoginDto } from "src/modules/admin/dto/login-admin.dto";
import { CacheService } from "src/modules/common/cache-service";
import { CustomJwtService } from "src/modules/common/custom-jwt-service";
import { UnitOfWork } from "src/modules/common/unit-of-work";
import { AdminRepository } from "src/repositories/admin.repository";
import { BranchRepository } from "src/repositories/branch.repository";

describe("AdminService", () => {
    let service: AdminService;
    let adminRepo: jest.Mocked<AdminRepository>;
    let branchRepo: jest.Mocked<BranchRepository>;
    let jwtService: jest.Mocked<CustomJwtService>;
    let cacheService: jest.Mocked<CacheService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AdminService],
        })
            .useMocker((token) => {
                if (token === AdminRepository) {
                    return {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        find: jest.fn(),
                    };
                }
                if (token === BranchRepository) {
                    return { findOne: jest.fn() };
                }
                if (token === CustomJwtService) {
                    return { CreateSignedTokens: jest.fn() };
                }
                if (token === UnitOfWork) {
                    return { Commit: jest.fn() };
                }
                if (token === CacheService) {
                    return { GetOrCreate: jest.fn() };
                }
            })
            .compile();

        service = module.get(AdminService);
        adminRepo = module.get(AdminRepository);
        branchRepo = module.get(BranchRepository);
        jwtService = module.get(CustomJwtService);
        cacheService = module.get(CacheService);
    });

    describe("CreateAdminAsync", () => {
        it("should throw if email already exists", async () => {
            adminRepo.findOne.mockResolvedValueOnce(new Admin());
            const dto = new CreateAdminDto();
            dto.email = "test@test.com";

            await expect(service.CreateAdminAsync(dto)).rejects.toThrow(
                new BadRequestException("email already exists"),
            );
        });

        it("should throw if branch id does not exist", async () => {
            adminRepo.findOne.mockResolvedValueOnce(null);
            branchRepo.findOne.mockResolvedValueOnce(null);
            const dto = new CreateAdminDto();
            dto.email = "test@test.com";
            dto.branchId = "invalid_id";

            await expect(service.CreateAdminAsync(dto)).rejects.toThrow(
                new BadRequestException("branch Id does not exist"),
            );
        });

        it("should create admin successfully without branch", async () => {
            adminRepo.findOne.mockResolvedValueOnce(null);
            const dto = new CreateAdminDto();
            dto.email = "test@test.com";
            dto.password = "password";

            const result = await service.CreateAdminAsync(dto);

            expect(result.email).toBe(dto.email);
        });

        it("should create admin successfully with branch", async () => {
            adminRepo.findOne.mockResolvedValueOnce(null);
            branchRepo.findOne.mockResolvedValueOnce(new Branch());
            const dto = new CreateAdminDto();
            dto.email = "test@test.com";
            dto.password = "password";
            dto.branchId = "valid_id";

            const result = await service.CreateAdminAsync(dto);

            expect(result.email).toBe(dto.email);
        });
    });

    describe("AdminLoginAsync", () => {
        it("should throw if admin not found", async () => {
            adminRepo.findOne.mockResolvedValueOnce(null);
            const dto = new AdminLoginDto();
            dto.email = "test@test.com";
            dto.password = "password";

            await expect(service.AdminLoginAsync(dto)).rejects.toThrow(
                new UnauthorizedException("Invalid Credentials"),
            );
        });

        it("should throw if password does not match", async () => {
            const admin = new Admin();
            admin.password = await bcrypt.hash("password", 10);
            adminRepo.findOne.mockResolvedValueOnce(admin);

            const dto = new AdminLoginDto();
            dto.email = "test@test.com";
            dto.password = "wrong_password";

            await expect(service.AdminLoginAsync(dto)).rejects.toThrow(
                new UnauthorizedException("Invalid Credentials"),
            );
        });

        it("should return tokens if login successful", async () => {
            const admin = new Admin();
            admin.password = await bcrypt.hash("password", 10);
            adminRepo.findOne.mockResolvedValueOnce(admin);
            jwtService.CreateSignedTokens.mockResolvedValueOnce({
                accessToken: "token",
            });

            const dto = new AdminLoginDto();
            dto.email = "test@test.com";
            dto.password = "password";

            const result = await service.AdminLoginAsync(dto);

            expect(result.accessToken).toBe("token");
        });
    });

    describe("GetAdminByIdForGuard", () => {
        it("should call cache service", async () => {
            const spy = jest.spyOn(cacheService, "GetOrCreate");
            await service.GetAdminByIdForGuard("id");
            expect(spy).toHaveBeenCalled();
        });
    });
});
