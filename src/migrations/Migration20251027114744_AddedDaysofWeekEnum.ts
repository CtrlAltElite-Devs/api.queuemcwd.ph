import { Migration } from "@mikro-orm/migrations";

export class Migration20251027114744_AddedDaysofWeekEnum extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table \`month_day\` add \`dayof_week\` varchar(255) not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`month_day\` drop column \`dayof_week\`;`);
  }
}
