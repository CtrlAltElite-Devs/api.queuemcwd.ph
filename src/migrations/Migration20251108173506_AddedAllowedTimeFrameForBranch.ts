import { Migration } from "@mikro-orm/migrations";

export class Migration20251108173506_AddedAllowedTimeFrameForBranch extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`branch\` add \`allowed_time_frame\` int not null default 7;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`branch\` drop column \`allowed_time_frame\`;`);
    }
}
