import { Migration } from "@mikro-orm/migrations";

export class Migration20251027133541_AddedIndexToMonthDayTable extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table \`month_day\` add index \`month_day_is_working_day_index\`(\`is_working_day\`);`,
    );
    this.addSql(
      `alter table \`month_day\` add index \`month_day_year_month_day_index\`(\`year\`, \`month\`, \`day\`);`,
    );
    this.addSql(
      `alter table \`month_day\` add index \`month_day_year_month_index\`(\`year\`, \`month\`);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`month_day\` drop index \`month_day_is_working_day_index\`;`);
    this.addSql(`alter table \`month_day\` drop index \`month_day_year_month_day_index\`;`);
    this.addSql(`alter table \`month_day\` drop index \`month_day_year_month_index\`;`);
  }
}
