import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import { BranchSeeder } from "./branch-seeder";
import { MonthDaySeeder } from "./month-day.seeder";
import { SuperAdminSeeder } from "./super-admin.seeder";

export class DatabaseSeeder extends Seeder {
    private readonly logger = new Logger(DatabaseSeeder.name);
    async run(em: EntityManager): Promise<void> {
        this.logger.log("Seeding Database...");
        return this.call(em, [SuperAdminSeeder, BranchSeeder, MonthDaySeeder]);
    }
}
