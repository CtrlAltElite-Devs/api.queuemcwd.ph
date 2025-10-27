import { Migration } from '@mikro-orm/migrations';

export class Migration20251027113029_AddedDayPropertyInMonthDay extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`month_day\` add \`day\` int not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`month_day\` drop column \`day\`;`);
  }

}
