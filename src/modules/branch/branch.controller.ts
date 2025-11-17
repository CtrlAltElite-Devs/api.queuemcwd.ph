import { CacheTTL } from "@nestjs/cache-manager";
import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseInterceptors,
    Version,
} from "@nestjs/common";
import { BranchDataCacheTTL } from "src/constants/cache.constants";
import { Branch } from "src/entities/branch.entity";
import { DynamicCacheInterceptor } from "src/interceptors/dynamic-cache-interceptor";
import { UseBranchGuard, UseSuperAdminOnlyGuard } from "src/security/decorators/index.decorators";
import { BranchEntity } from "src/security/decorators/queried-entity-decorators/branch-entity.decorator";
import { SeedMonthDayDto } from "../month-day/dtos/seed-month-day.dto";
import { MonthDayResourceParameter } from "../month-day/resource-parameters/month-day.params";
import { BranchService } from "./branch.service";
import { CreateBranchDto } from "./dto/create-branch.dto";
import { UpdateBranchDto } from "./dto/update-branch.dto";

@Controller("branch")
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Get()
    async GetAllBranchesAsync() {
        return await this.branchService.GetAllBranchesAsync();
    }

    @Get("/:branchId/month-days")
    @UseInterceptors(DynamicCacheInterceptor)
    @CacheTTL(BranchDataCacheTTL)
    async GetAllMonthDaysForBranch(
        @Param("branchId", new ParseUUIDPipe()) branchId: string,
        @Query() params: MonthDayResourceParameter,
    ) {
        return await this.branchService.GetMonthDaysForBranchAsync(branchId, params);
    }

    @Post("/:branchId/month-days/seed")
    @UseBranchGuard()
    async SeedMonthDaysForBranch(@BranchEntity() branch: Branch, @Body() body: SeedMonthDayDto) {
        return await this.branchService.SeedMonthDayForBranchAsync(branch, body);
    }

    @Get("/:branchId/month-days/:monthDayId/slots")
    @UseInterceptors(DynamicCacheInterceptor)
    @CacheTTL(BranchDataCacheTTL)
    async GetAllSlotsForMonthDayBranch(
        @Param("branchId", new ParseUUIDPipe()) branchId: string,
        @Param("monthDayId", new ParseUUIDPipe()) monthDayId: string,
    ) {
        return await this.branchService.GetMonthDaySlots(branchId, monthDayId);
    }

    @Get("/:branchId/month-days/:monthDayId/slots")
    @Version("2")
    @UseInterceptors(DynamicCacheInterceptor)
    @CacheTTL(BranchDataCacheTTL)
    async GetAllSlotsForMonthDayBranchV2(
        @Param("branchId", new ParseUUIDPipe()) branchId: string,
        @Param("monthDayId", new ParseUUIDPipe()) monthDayId: string,
    ) {
        return await this.branchService.GetMonthDaySlotsV2(branchId, monthDayId);
    }

    @Post()
    @UseSuperAdminOnlyGuard()
    async CreateBranchAsync(@Body() dto: CreateBranchDto) {
        return await this.branchService.CreateBranchAsync(dto);
    }

    @Patch("/:branchId")
    @UseBranchGuard()
    async UpdateBranch2(@BranchEntity() branch: Branch, @Body() dto: UpdateBranchDto) {
        return await this.branchService.UpdateBranchAsync(branch, dto);
    }
}
