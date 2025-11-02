import { Migration } from "@mikro-orm/migrations";

export class Migration20251102014030_AddedAppointmentTypeAndRemovedAge extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`appointment\` drop column \`age\`;`);

        this.addSql(`alter table \`appointment\` add \`appointment_type\` varchar(255) not null;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`appointment\` drop column \`appointment_type\`;`);

        this.addSql(`alter table \`appointment\` add \`age\` int not null;`);
    }
}
