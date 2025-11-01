import { Migration } from "@mikro-orm/migrations";

export class Migration20251027172127 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` modify \`category_code\` varchar(255) not null, modify \`queue_status\` varchar(255) not null;`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` modify \`category_code\` int not null, modify \`queue_status\` int not null;`,
        );
    }
}
