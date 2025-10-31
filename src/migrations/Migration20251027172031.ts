import { Migration } from "@mikro-orm/migrations";

export class Migration20251027172031 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`appointment\` modify \`category_code\` int not null, modify \`queue_status\` int not null;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table \`appointment\` modify \`category_code\` tinyint not null, modify \`queue_status\` tinyint not null;`,
    );
  }
}
