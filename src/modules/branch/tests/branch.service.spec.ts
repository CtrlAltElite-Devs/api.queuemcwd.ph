import { Collection } from "@mikro-orm/core";
import { BadRequestException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Branch } from "src/entities/branch.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { BranchService } from "src/modules/branch/branch.service";
import { CreateBranchDto } from "src/modules/branch/dto/create-branch.dto";
import { UnitOfWork } from "src/modules/common/unit-of-work";
import { SeedMonthDayDto } from "src/modules/month-day/dtos/seed-month-day.dto";
import { AdminRepository } from "src/repositories/admin.repository";
import { BranchRepository } from "src/repositories/branch.repository";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { SlotsRepository } from "src/repositories/slots.repository";

jest.mock("src/utils/generate-month-days.util", () => ({
    createMonthDays: jest.fn().mockReturnValue([]),
}));

jest.mock("src/utils/get-current-month-data.util", () => ({
    getCurrentMonthMetadata: jest.fn().mockReturnValue({ month: 1, year: 2023 }),
    getMonthMetadata: jest.fn().mockReturnValue({ month: 1, year: 2023 }),
}));

describe("BranchService", () => {
    let service: BranchService;
    let branchRepo: jest.Mocked<BranchRepository>;
    let monthDayRepo: jest.Mocked<MonthDayRepository>;
    let slotRepo: jest.Mocked<SlotsRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BranchService],
        })
            .useMocker((token) => {
                if (token === BranchRepository) {
                    return {
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        create: jest.fn(),
                    };
                }
                if (token === MonthDayRepository) {
                    return {
                        findOne: jest.fn(),
                        GetMonthDayForBranchAsync: jest.fn(),
                    };
                }
                if (token === SlotsRepository) {
                    return { findAll: jest.fn() };
                }
                if (token === AdminRepository) {
                    return { find: jest.fn() };
                }
                if (token === UnitOfWork) {
                    return { Commit: jest.fn() };
                }
            })
            .compile();

        service = module.get(BranchService);
        branchRepo = module.get(BranchRepository);
        monthDayRepo = module.get(MonthDayRepository);
        slotRepo = module.get(SlotsRepository);
    });

    describe("CreateBranchAsync", () => {
        it("should throw if branch code already exists", async () => {
            branchRepo.findOne.mockResolvedValueOnce(new Branch());
            const dto = new CreateBranchDto();
            dto.branchCode = "TEST";

            await expect(service.CreateBranchAsync(dto)).rejects.toThrow(
                new BadRequestException("Branch Code already exists"),
            );
        });

        it("should create branch successfully", async () => {
            branchRepo.findOne.mockResolvedValueOnce(null);
            const dto = new CreateBranchDto();
            dto.branchCode = "TEST";
            dto.name = "Test Branch";
            dto.address = "Test Address";

            // Mock the create method to intercept the new branch and mock its collection
            branchRepo.create.mockImplementation((entity: Branch) => {
                entity.monthDays = { add: jest.fn() } as unknown as Collection<
                    MonthDay,
                    typeof entity
                >;
                return entity;
            });

            const spy = jest.spyOn(branchRepo, "create");

            const result = await service.CreateBranchAsync(dto);

            expect(spy).toHaveBeenCalled();
            expect(result.branchCode).toBe(dto.branchCode);
        });
    });

    describe("GetMonthDaySlots", () => {
        it("should throw if month day not found", async () => {
            monthDayRepo.findOne.mockResolvedValueOnce(null);

            await expect(service.GetMonthDaySlots("branchId", "dayId")).rejects.toThrow(
                new BadRequestException("Month Day ID not found"),
            );
        });

        it("should throw if not a working day", async () => {
            const monthDay = new MonthDay();
            monthDay.isWorkingDay = false;
            monthDayRepo.findOne.mockResolvedValueOnce(monthDay);

            await expect(service.GetMonthDaySlots("branchId", "dayId")).rejects.toThrow(
                new BadRequestException("Month Day is not a working day"),
            );
        });

        it("should return slots", async () => {
            const monthDay = new MonthDay();
            monthDay.isWorkingDay = true;
            monthDayRepo.findOne.mockResolvedValueOnce(monthDay);
            slotRepo.findAll.mockResolvedValueOnce([]);

            const result = await service.GetMonthDaySlots("branchId", "dayId");

            expect(result).toEqual([]);
        });
    });

    describe("SeedMonthDayForBranchAsync", () => {
        it("should throw if already seeded", async () => {
            monthDayRepo.findOne.mockResolvedValueOnce(new MonthDay());
            const branch = new Branch();
            const dto = new SeedMonthDayDto();
            dto.month = 1;
            dto.year = 2023;

            await expect(service.SeedMonthDayForBranchAsync(branch, dto)).rejects.toThrow(
                new BadRequestException(
                    "Month days for the specified month and year already seeded",
                ),
            );
        });

        it("should seed successfully", async () => {
            monthDayRepo.findOne.mockResolvedValueOnce(null);
            const branch = new Branch();
            // Mock the collection
            branch.monthDays = { add: jest.fn() } as unknown as Collection<MonthDay, typeof branch>;

            const dto = new SeedMonthDayDto();
            dto.month = 1;
            dto.year = 2023;

            const result = await service.SeedMonthDayForBranchAsync(branch, dto);

            expect(result.seededMonthDays).toBe(0);
        });
    });
});
