import { Migration } from "@mikro-orm/migrations";

export class Migration20251107175357_AddedSoftDeletionProperty extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`branch\` add \`deleted_at\` varchar(255) null;`);

        this.addSql(`alter table \`admin\` add \`deleted_at\` varchar(255) null;`);

        this.addSql(`alter table \`month_day\` add \`deleted_at\` varchar(255) null;`);

        this.addSql(`alter table \`slot\` add \`deleted_at\` varchar(255) null;`);

        this.addSql(`alter table \`appointment\` add \`deleted_at\` varchar(255) null;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`branch\` drop column \`deleted_at\`;`);

        this.addSql(`alter table \`admin\` drop column \`deleted_at\`;`);

        this.addSql(`alter table \`month_day\` drop column \`deleted_at\`;`);

        this.addSql(`alter table \`slot\` drop column \`deleted_at\`;`);

        this.addSql(`alter table \`appointment\` drop column \`deleted_at\`;`);
    }
}
