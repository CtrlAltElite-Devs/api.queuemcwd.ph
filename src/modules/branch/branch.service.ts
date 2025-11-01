import { BadRequestException, Injectable } from "@nestjs/common";
import { Branch } from "src/entities/branch.entity";
import { AdminRepository } from "src/repositories/admin.repository";
import { BranchRepository } from "src/repositories/branch.repository";
import { createMonthDays } from "src/utils/generate-month-days.util";
import { getCurrentMonthMetadata } from "src/utils/get-current-month-data.util";
import { UnitOfWork } from "../common/unit-of-work";
import { BranchDto } from "./dto/branch.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";

@Injectable()
export class BranchService {
    constructor(
        private readonly branchRepository: BranchRepository,
        private readonly adminRepository: AdminRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async GetAllBranchesAsync(): Promise<BranchDto[]> {
        const branches = await this.branchRepository.findAll();
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
}
