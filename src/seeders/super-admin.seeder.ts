import { EntityManager } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { env } from "src/configurations/env/env.config";
import { Admin, AdminRole } from "src/entities/admin.entity";

export class SuperAdminSeeder extends Seeder {
    private readonly logger = new Logger(SuperAdminSeeder.name);

    async run(em: EntityManager): Promise<void> {
        this.logger.log("Seeding Super Admin User...");
        const { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = env;
        const existingAdmin = await em.findOne(Admin, { email: SUPER_ADMIN_EMAIL });

        if (existingAdmin) {
            this.logger.log("Super Admin already exists. Skipping seeding...");
            return;
        }

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(SUPER_ADMIN_PASSWORD, salt);

        const admin = new Admin();
        admin.email = SUPER_ADMIN_EMAIL;
        admin.password = hash;
        admin.role = AdminRole.SUPER_ADMIN;
        await em.persistAndFlush(admin);
    }
}
