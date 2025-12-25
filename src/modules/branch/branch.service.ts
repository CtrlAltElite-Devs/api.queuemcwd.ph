import { BadRequestException, Injectable } from "@nestjs/common";
import { BranchDataCacheKey, BranchDataCacheTTL, BranchKey } from "src/constants/cache.constants";
import { Branch } from "src/entities/branch.entity";
import { AdminRepository } from "src/repositories/admin.repository";
import { BranchRepository } from "src/repositories/branch.repository";
import { MonthDayRepository } from "src/repositories/month-day.repository";
import { SlotsRepository } from "src/repositories/slots.repository";
import { createMonthDays } from "src/utils/generate-month-days.util";
import { getCurrentMonthMetadata, getMonthMetadata } from "src/utils/get-current-month-data.util";
import { UnitOfWork } from "../common/unit-of-work";
import { MonthDayDto } from "../month-day/dtos/month-day.dto";
import { SeedMonthDayDto } from "../month-day/dtos/seed-month-day.dto";
import { MonthDayResourceParameter } from "../month-day/resource-parameters/month-day.params";
import { SlotDto } from "../slots/dtos/slot.dto";
import { BranchDto } from "./dto/branch.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";
import { SlotDtosResponse } from "../slots/dtos/slot-dtos-response";
import { CacheService } from "../common/cache-service";

@Injectable()
export class BranchService {
    constructor(
        private readonly branchRepository: BranchRepository,
        private readonly monthDayRepository: MonthDayRepository,
        private readonly slotRepository: SlotsRepository,
        private readonly adminRepository: AdminRepository,
        private readonly unitOfWork: UnitOfWork,
        private readonly cacheService: CacheService,
    ) {}

    async GetAllBranchesAsync(): Promise<BranchDto[]> {
        const branches = await this.cacheService.GetOrCreate(`${BranchDataCacheKey}:*`, {
            factory: () => this.branchRepository.findAll(),
            ttl: BranchDataCacheTTL,
        });
        if (branches.length > 0) {
            return branches.map((branch) => {
                return BranchDto.Map(branch);
            });
        }
        return [];
    }

    async CreateBranchAsync(dto: CreateBranchDto) {
        if ((await this.branchRepository.findOne({ branchCode: dto.branchCode })) !== null) {
            throw new BadRequestException("Branch Code already exists");
        }

        const newBranch = new Branch();
        newBranch.name = dto.name;
        newBranch.branchCode = dto.branchCode;
        newBranch.address = dto.address;

        if (dto.adminIds && dto.adminIds.length > 0) {
            const admins = await this.adminRepository.find(
                { id: { $in: dto.adminIds } },
                { populate: ["branch"] },
            );

            if (admins.length === 0) {
                throw new BadRequestException("Please verify admin ids");
            }

            for (const admin of admins) {
                if (admin.branch !== null) {
                    throw new BadRequestException(
                        `Admin with id:${admin.id} is already assigned to branch:${admin.branch?.branchCode} `,
                    );
                }
                admin.branch = newBranch;
            }
        }

        this.branchRepository.create(newBranch);

        const currentMonthMetadata = getCurrentMonthMetadata();
        const monthDays = createMonthDays(newBranch, currentMonthMetadata);
        newBranch.monthDays.add(monthDays);
        await this.unitOfWork.Commit();
        return BranchDto.Map(newBranch);
    }

    async GetMonthDaySlots(branchId: string, monthDayId: string) {
        const monthDay = await this.monthDayRepository.findOne(
            { id: monthDayId },
            { fields: ["id", "isWorkingDay"] },
        );

        if (monthDay === null) {
            throw new BadRequestException("Month Day ID not found");
        }

        if (!monthDay.isWorkingDay) {
            throw new BadRequestException("Month Day is not a working day");
        }

        const slots = await this.slotRepository.findAll({
            where: {
                monthDay: { id: monthDayId },
                branch: { id: branchId },
            },
            orderBy: { startTime: "ASC" },
            populate: ["appointments", "branch", "monthDay"],
        });

        return slots.map((slot) => {
            const dto = SlotDto.Map(slot);
            dto.dayId = monthDayId;
            dto.booked = slot.ComputeBooked();
            return dto;
        });
    }

    async GetMonthDaySlotsV2(branchId: string, monthDayId: string) {
        const monthDay = await this.monthDayRepository.findOne(
            { id: monthDayId },
            { fields: ["id", "isWorkingDay", "additionalNotes", "month", "year", "day"] },
        );

        if (monthDay === null) {
            throw new BadRequestException("Month Day ID not found");
        }

        if (!monthDay.isWorkingDay) {
            const message =
                monthDay.additionalNotes ??
                `${monthDay.ConvertToMoment().format("MMMM Do, YYYY")} is a non working day`;
            return SlotDtosResponse.Map([], message);
        }

        const slots = await this.slotRepository.findAll({
            where: {
                monthDay: { id: monthDayId },
                branch: { id: branchId },
            },
            orderBy: { startTime: "ASC" },
            populate: ["appointments", "branch", "monthDay"],
        });

        const slotDtos = slots.map((slot) => {
            const dto = SlotDto.Map(slot);
            dto.dayId = monthDayId;
            dto.booked = slot.ComputeBooked();
            return dto;
        });

        return SlotDtosResponse.Map(slotDtos, monthDay.additionalNotes);
    }

    async GetMonthDaysForBranchAsync(branchId: string, params: MonthDayResourceParameter) {
        params.Validate();

        const result = await this.monthDayRepository.GetMonthDayForBranchAsync(branchId, params);

        return result.map((monthDay) => {
            const dto = MonthDayDto.Map(monthDay);
            return dto;
        });
    }

    async SeedMonthDayForBranchAsync(branch: Branch, dto: SeedMonthDayDto) {
        dto.validateOrThrow();

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

    async UpdateBranchAsync(branch: Branch, dto: UpdateBranchDto) {
        branch.Update(dto);
        await this.unitOfWork.Commit({
            invalidateKeys: BranchKey(branch.id),
        });
        return branch;
    }
}
