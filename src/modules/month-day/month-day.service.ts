import { BadRequestException, Injectable } from "@nestjs/common";
import { BranchRepository } from "src/repositories/branch.repository";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { createMonthDays } from "src/utils/generate-month-days.util";
import { getMonthMetadata } from "src/utils/get-current-month-data.util";
import { UnitOfWork } from "../common/unit-of-work";
import { MonthDayDto } from "./dtos/month-day.dto";
import { SeedMonthDayDto } from "./dtos/seed-month-day.dto";
import { UpdateMonthDayDto } from "./dtos/update-month-day.dto";
import { MonthDayResourceParameter } from "./resource-parameters/month-day.params";

@Injectable()
export class MonthDayService {
    constructor(
        private readonly monthDayRepository: MonthDayRepository,
        private readonly branchRepository: BranchRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async GetMonthDaysAsync(params: MonthDayResourceParameter): Promise<MonthDayDto[]> {
        params.Validate();

        const result = await this.monthDayRepository.GetMonthDayAsync(params);

        return result.map((item) => {
            const dto = new MonthDayDto();
            dto.id = item.id;
            dto.month = item.month;
            dto.day = item.day;
            dto.dayofWeek = item.dayofWeek;
            dto.isWorkingDay = item.isWorkingDay;
            return dto;
        });
    }

    async SeedMonthDayAsync(dto: SeedMonthDayDto) {
        if (dto.month < 1 || dto.month > 12) {
            throw new BadRequestException("Invalid month: must be between 1 and 12");
        }
        if (dto.year < 1970 || dto.year > 2100) {
            throw new BadRequestException("Invalid year: must be between 1970 and 2100");
        }

        const branch = await this.branchRepository.findOne({ id: dto.branchId });
        if (!branch) {
            throw new BadRequestException("Branch not found");
        }

        const monthMetaData = getMonthMetadata(dto.month, dto.year);

        const exists = await this.monthDayRepository.findOne({
            branch: branch,
            month: monthMetaData.month,
            year: monthMetaData.year,
        });

        if (exists !== null) {
            throw new BadRequestException(
                "Month days for the specified month and year already seeded",
            );
        }
        const monthDays = createMonthDays(branch, monthMetaData);
        branch.monthDays.add(monthDays);
        await this.unitOfWork.Commit();

        return {
            seededMonthDays: monthDays.length,
            seededSlots: monthDays.reduce((acc, md) => acc + md.slots.getItems().length, 0),
        };
    }

    async UpdateMonthDay(monthDayId: string, dto: UpdateMonthDayDto) {
        const monthDay = await this.monthDayRepository.findOne({ id: monthDayId });
        if (monthDay === null) {
            throw new BadRequestException("Month Day not found");
        }

        monthDay.Update(dto);
        await this.unitOfWork.Commit();
        return MonthDayDto.Map(monthDay);
    }
}
