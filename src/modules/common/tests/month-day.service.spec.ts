import { Test, TestingModule } from "@nestjs/testing";
import { Branch } from "src/entities/branch.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { AdminDto } from "src/modules/admin/dto/admin.dto";
import { BatchUpdateMonthDaySlotsDto } from "src/modules/month-day/dtos/batch-update/batch-update-month-day-slots.dto";
import { CreateMonthDayOptionsDto } from "src/modules/month-day/dtos/batch-update/options.dto";
import { MonthDayService } from "src/modules/month-day/month-day.service";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { UnitOfWork } from "../unit-of-work";

jest.mock("src/utils/generate-month-days.util");

const ValidDtoFactory = () => {
    const dtoOptions = new BatchUpdateMonthDaySlotsDto();
    dtoOptions.options = new CreateMonthDayOptionsDto();
    return dtoOptions;
};

describe("MonthDayService", () => {
    let service: MonthDayService;
    let monthdayRepo: jest.Mocked<MonthDayRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [MonthDayService],
        })
            .useMocker((token) => {
                if (token === UnitOfWork) {
                    return { Commit: jest.fn() };
                }
                if (token === MonthDayRepository) {
                    return { findOne: jest.fn() };
                }
            })
            .compile();

        service = module.get(MonthDayService);
        monthdayRepo = module.get(MonthDayRepository);
    });

    describe("EditSlotForMonthDay", () => {
        it("should throw not found if monthday Id is null", async () => {
            monthdayRepo.findOne.mockResolvedValue(null);
            const admin = new AdminDto();
            await expect(
                service.EditSlotsForMonthDay(admin, "id", ValidDtoFactory()),
            ).rejects.toThrow("Month day not found");
        });

        it("should throw unauthorized if admin is not under month day branch", async () => {
            const branch = new Branch();
            branch.id = "b1";
            const monthDay = new MonthDay();
            monthDay.branch = branch;

            const admin = new AdminDto();
            admin.branchId = "b2";

            monthdayRepo.findOne.mockResolvedValue(monthDay);

            await expect(
                service.EditSlotsForMonthDay(admin, "id", ValidDtoFactory()),
            ).rejects.toThrow("Admin cannot manage this month day");
        });
    });
});

// describe("MonthDayService.EditSlotsForMonthDay", () => {
//     let service: MonthDayService;
//     let repo: jest.Mocked<MonthDayRepository>;
//     let uow: jest.Mocked<UnitOfWork>;

//     beforeEach(() => {
//         repo = { findOne: jest.fn() };
//         uow = { Commit: jest.fn() };
//         service = new MonthDayService(repo, uow);
//     });

//     it("should throw if DTO validation fails", async () => {
//         const admin = new AdminDto();
//         admin.branchId = "b1";
//         const dto = new BatchUpdateMonthDaySlotsDto();
//         dto.validateOrThrow = jest.fn(() => {
//             throw new BadRequestException("options missing");
//         });

//         await expect(service.EditSlotsForMonthDay(admin, "m1", dto)).rejects.toThrow(
//             BadRequestException,
//         );
//     });

//     it("should throw if month day not found", async () => {
//         const admin = new AdminDto();
//         admin.branchId = "b1";
//         const dto = new BatchUpdateMonthDaySlotsDto();
//         repo.findOne.mockResolvedValue(null);

//         await expect(service.EditSlotsForMonthDay(admin, "m1", dto)).rejects.toThrow(
//             NotFoundException,
//         );
//     });

//     it("should throw if admin is unauthorized", async () => {
//         const admin = new AdminDto();
//         admin.branchId = "b1";
//         const dto = new BatchUpdateMonthDaySlotsDto();
//         const monthDay = new MonthDay();
//         monthDay.branch = new Branch();
//         monthDay.branch.id = "b2";
//         repo.findOne.mockResolvedValue(monthDay);

//         await expect(service.EditSlotsForMonthDay(admin, "m1", dto)).rejects.toThrow(
//             UnauthorizedException,
//         );
//     });

//     it("should generate slots and commit successfully", async () => {
//         const admin = { branchId: "b1" } as any;
//         const monthDay = { branch: { id: "b1" }, slots: { set: jest.fn() } };
//         const generatedSlots = [{ id: 1, ComputeBooked: () => false }];
//         const dto = {
//             validateOrThrow: jest.fn(),
//             MapToOptionsValue: jest.fn().mockReturnValue({ some: "option" }),
//         };
//         (generateSlotsForMonthDay as jest.Mock).mockReturnValue(generatedSlots);
//         repo.findOne.mockResolvedValue(monthDay as any);

//         const result = await service.EditSlotsForMonthDay(admin, "m1", dto as any);

//         expect(dto.validateOrThrow).toHaveBeenCalled();
//         expect(generateSlotsForMonthDay).toHaveBeenCalledWith(monthDay, { some: "option" });
//         expect(monthDay.slots.set).toHaveBeenCalledWith(generatedSlots);
//         expect(uow.Commit).toHaveBeenCalled();
//         expect(result).toBeInstanceOf(Array);
//     });
// });
