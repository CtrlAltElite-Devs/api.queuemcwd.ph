import { Test, TestingModule } from "@nestjs/testing";
import { AdminDto } from "src/modules/admin/dto/admin.dto";
import { UnitOfWork } from "src/modules/common/unit-of-work";
import { MonthDayService } from "src/modules/month-day/month-day.service";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { AbilityFactory } from "src/security/ability/ability.factory";

jest.mock("src/utils/generate-month-days.util");

describe("MonthDayService", () => {
    let service: MonthDayService;
    let slotsRepo: jest.Mocked<SlotsRepository>;

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
                if (token === SlotsRepository) {
                    return { findAll: jest.fn() };
                }
                if (token === AbilityFactory) {
                    return { defineAbilityForAdmin: jest.fn() };
                }
            })
            .compile();

        service = module.get(MonthDayService);
        slotsRepo = module.get(SlotsRepository);
    });

    describe("EditSlotForMonthDay", () => {
        it("should throw not found if monthday Id is not found", async () => {
            slotsRepo.findAll.mockResolvedValue([]);
            const admin = new AdminDto();
            await expect(service.GetAppointmentsFromMonthday(admin, "id")).rejects.toThrow(
                "month day id not found",
            );
        });
    });
});
