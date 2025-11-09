import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
} from "@nestjs/common";
import type { AuthenticatedRequest } from "src/security/common/authenticated.request";
import {
    UseAdminOnlyGuard,
    UseSuperAdminOnlyGuard,
} from "src/security/decorators/index.decorators";
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
    async GetAllMonthDaysForBranch(
        @Param("branchId", new ParseUUIDPipe()) branchId: string,
        @Query() params: MonthDayResourceParameter,
    ) {
        return await this.branchService.GetMonthDaysForBranchAsync(branchId, params);
    }

    @Post("/:branchId/month-days/seed")
    @UseAdminOnlyGuard()
    async SeedMonthDaysForBranch(
        @Req() request: AuthenticatedRequest,
        @Param("branchId", new ParseUUIDPipe()) branchId: string,
        @Body() body: SeedMonthDayDto,
    ) {
        return await this.branchService.SeedMonthDayForBranchAsync(branchId, request.admin!, body);
    }

    @Get("/:branchId/month-days/:monthDayId/slots")
    async GetAllSlotsForMonthDayBranch(
        @Param("branchId", new ParseUUIDPipe()) branchId: string,
        @Param("monthDayId", new ParseUUIDPipe()) monthDayId: string,
    ) {
        return await this.branchService.GetMonthDaySlots(branchId, monthDayId);
    }

    @Post()
    @UseSuperAdminOnlyGuard()
    async CreateBranchAsync(@Body() dto: CreateBranchDto) {
        return await this.branchService.CreateBranchAsync(dto);
    }

    @Patch("/:branchId")
    @UseAdminOnlyGuard()
    async UpdateBranch(
        @Req() request: AuthenticatedRequest,
        @Param("branchId", new ParseUUIDPipe()) branchId: string,
        @Body() body: UpdateBranchDto,
    ) {
        return await this.branchService.UpdateBranchAsync(request.admin!, branchId, body);
    }
}
