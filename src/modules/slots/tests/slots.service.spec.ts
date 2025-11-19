import { Collection } from "@mikro-orm/core";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import moment from "moment";
import { Branch } from "src/entities/branch.entity";
import { MonthDay } from "src/entities/monthDay.entity";
import { Slot } from "src/entities/slot.entity";
import { AdminDto } from "src/modules/admin/dto/admin.dto";
import { UnitOfWork } from "src/modules/common/unit-of-work";
import { CreateSlotDto } from "src/modules/slots/dtos/create-slot.dto";
import { UpdateSlotDto } from "src/modules/slots/dtos/update-slot.dto";
import { SlotsService } from "src/modules/slots/slots.service";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { SlotsRepository } from "src/repositories/slots.repository";

describe("SlotsService", () => {
    let service: SlotsService;
    let slotRepo: jest.Mocked<SlotsRepository>;
    let monthDayRepo: jest.Mocked<MonthDayRepository>;
    let unitOfWork: jest.Mocked<UnitOfWork>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SlotsService],
        })
            .useMocker((token) => {
                if (token === SlotsRepository) {
                    return {
                        find: jest.fn(),
                        create: jest.fn(),
                    };
                }
                if (token === MonthDayRepository) {
                    return {
                        findOne: jest.fn(),
                        getEntityManager: jest.fn().mockReturnValue({ populate: jest.fn() }),
                    };
                }
                if (token === UnitOfWork) {
                    return { Commit: jest.fn() };
                }
            })
            .compile();

        service = module.get(SlotsService);
        slotRepo = module.get(SlotsRepository);
        monthDayRepo = module.get(MonthDayRepository);
        unitOfWork = module.get(UnitOfWork);
    });

    describe("CreateSlot", () => {
        it("should throw if month day not found", async () => {
            monthDayRepo.findOne.mockResolvedValueOnce(null);
            const admin = new AdminDto();
            const dto = new CreateSlotDto();
            dto.monthDayId = "invalid";

            await expect(service.CreateSlot(admin, dto)).rejects.toThrow(
                new NotFoundException("Month day not found"),
            );
        });

        it("should create slot successfully", async () => {
            const branch = new Branch();
            branch.id = "branchId";
            const monthDay = new MonthDay();
            monthDay.branch = branch;
            monthDay.slots = new Collection<Slot>(monthDay);
            monthDay.ConvertToMoment = jest.fn().mockReturnValue(moment());

            monthDayRepo.findOne.mockResolvedValueOnce(monthDay);

            const admin = new AdminDto();
            admin.branchId = "branchId";

            const dto = new CreateSlotDto();
            dto.monthDayId = "valid";
            dto.startTime = "08:00";
            dto.endTime = "09:00";
            dto.limit = 10;

            const result = await service.CreateSlot(admin, dto);
            const spyCreate = jest.spyOn(slotRepo, "create");
            const spyCommit = jest.spyOn(unitOfWork, "Commit");
            expect(spyCreate).toHaveBeenCalled();
            expect(spyCommit).toHaveBeenCalled();
            expect(result.maxCapacity).toBe(10);
        });
    });

    describe("UpdateSlotAsync", () => {
        it("should update slot successfully", async () => {
            const slot = new Slot();
            slot.monthDay = new MonthDay();
            slot.branch = new Branch();
            slot.branch.id = "branchId";
            slot.monthDay.ConvertToMoment = jest.fn().mockReturnValue(moment());

            slotRepo.find.mockResolvedValueOnce([]);

            const dto = new UpdateSlotDto();
            dto.limit = 20;
            dto.startTime = "10:00";
            dto.endTime = "11:00";

            const result = await service.UpdateSlotAsync(slot, dto);
            const spyCommit = jest.spyOn(unitOfWork, "Commit");
            expect(spyCommit).toHaveBeenCalled();
            expect(result.maxCapacity).toBe(20);
        });

        it("should throw if invalid time format", async () => {
            const slot = new Slot();
            slot.monthDay = new MonthDay();

            const dto = new UpdateSlotDto();
            dto.startTime = "25:00"; // Invalid
            dto.endTime = "11:00";

            await expect(service.UpdateSlotAsync(slot, dto)).rejects.toThrow();
        });
    });
});
