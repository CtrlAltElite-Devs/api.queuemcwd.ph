import { Body, Controller, Get, Post } from "@nestjs/common";
import { BranchService } from "./branch.service";
import { CreateBranchDto } from "./dto/create-branch.dto";

@Controller("branch")
export class BranchController {
    constructor(private readonly branchService: BranchService) {}

    @Get()
    async GetAllBranchesAsync() {
        return await this.branchService.GetAllBranchesAsync();
    }

    @Post()
    async CreateBranchAsync(@Body() dto: CreateBranchDto) {
        return await this.branchService.CreateBranchAsync(dto);
    }
}
