import { Migration } from "@mikro-orm/migrations";

export class Migration20251102014425_AddedAdditionalFieldsToAppointment extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` add \`account_code\` varchar(255) not null, add \`contact_person\` varchar(255) not null, add \`contact\` varchar(255) not null;`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` drop column \`account_code\`, drop column \`contact_person\`, drop column \`contact\`;`,
        );
    }
}
