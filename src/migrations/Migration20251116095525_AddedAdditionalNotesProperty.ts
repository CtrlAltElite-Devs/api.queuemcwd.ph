import { Migration } from "@mikro-orm/migrations";

export class Migration20251116095525_AddedAdditionalNotesProperty extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`month_day\` add \`additional_notes\` varchar(255) null;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`month_day\` drop column \`additional_notes\`;`);
    }
}
