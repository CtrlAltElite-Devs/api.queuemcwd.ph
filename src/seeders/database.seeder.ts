import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import { MonthDaySeeder } from "./month-day.seeder";

export class DatabaseSeeder extends Seeder{
    private readonly logger = new Logger(DatabaseSeeder.name)
    async run(em: EntityManager): Promise<void> {
        this.logger.log("Seeding Database...");
        return this.call(em, [MonthDaySeeder])
    }

}