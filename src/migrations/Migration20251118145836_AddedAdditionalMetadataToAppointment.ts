import { Migration } from "@mikro-orm/migrations";

export class Migration20251118145836_AddedAdditionalMetadataToAppointment extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` add \`completed_at\` datetime null, add \`cancelled_at\` datetime null, add \`no_show_at\` datetime null;`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` drop column \`completed_at\`, drop column \`cancelled_at\`, drop column \`no_show_at\`;`,
        );
    }
}
