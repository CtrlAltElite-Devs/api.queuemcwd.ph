import { Branch } from "src/entities/branch.entity";

export class BranchDto {
    id: string;
    name: string;
    branchCode: string;
    address: string;
    allowedTimeFrame: number;

    static Map(branch: Branch): BranchDto {
        const branchDto = new BranchDto();
        branchDto.id = branch.id;
        branchDto.name = branch.name;
        branchDto.branchCode = branch.branchCode;
        branchDto.address = branch.address;
        branchDto.allowedTimeFrame = branch.allowedTimeFrame;
        return branchDto;
    }
}
