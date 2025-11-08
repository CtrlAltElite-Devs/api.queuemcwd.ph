import { Migration } from "@mikro-orm/migrations";

export class Migration20251108173637_AddedCommentToAllowedTimeFrame extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table \`branch\` modify \`allowed_time_frame\` int not null default 7 comment 'in day format';`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`branch\` modify \`allowed_time_frame\` int not null default 7;`);
    }
}
