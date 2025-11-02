import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import { Branch } from "src/entities/branch.entity";

export class BranchSeeder extends Seeder {
    private readonly logger = new Logger(BranchSeeder.name);

    async run(em: EntityManager): Promise<void> {
        this.logger.log("Seeding Branches");
        const exists = (await em.count(Branch, {})) > 0;
        if (exists) {
            this.logger.log("Branches already exists, skipping seeding...");
            return;
        }

        const defaultBranches = this.GetDefaultBranches();
        await em.insertMany(defaultBranches);
        this.logger.log("Succesfully Seeded Default Branches");
    }

    GetDefaultBranches() {
        const mainOfficeBranch = new Branch();
        mainOfficeBranch.name = "Main Office";
        mainOfficeBranch.branchCode = "MAIN";
        mainOfficeBranch.address = "Magallanes cor. Lapu-lapu Sts., Cebu City, 6000";

        const smConsolacionBranch = new Branch();
        smConsolacionBranch.name = "SM Consolacion Office";
        smConsolacionBranch.branchCode = "SMCL";
        smConsolacionBranch.address =
            "SM Consolacion 2nd Level, Government Service Express Center (GSEC)";

        return [mainOfficeBranch, smConsolacionBranch];
    }
}
