import { Migration } from '@mikro-orm/migrations';

export class Migration20251027133747_AddedIndexToAppointmentTable extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`appointment\` add index \`appointment_category_code_index\`(\`category_code\`);`);
    this.addSql(`alter table \`appointment\` add index \`appointment_queue_status_index\`(\`queue_status\`);`);
    this.addSql(`alter table \`appointment\` add index \`appointment_date_validity_queue_status_index\`(\`date_validity\`, \`queue_status\`);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`appointment\` drop index \`appointment_category_code_index\`;`);
    this.addSql(`alter table \`appointment\` drop index \`appointment_queue_status_index\`;`);
    this.addSql(`alter table \`appointment\` drop index \`appointment_date_validity_queue_status_index\`;`);
  }

}
