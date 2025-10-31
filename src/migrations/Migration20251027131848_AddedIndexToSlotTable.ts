/* eslint-disable @typescript-eslint/require-await */
import { Migration } from "@mikro-orm/migrations";

export class Migration20251027131848_AddedIndexToSlotTable extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table \`slot\` add index \`slot_is_active_index\`(\`is_active\`);`);
    this.addSql(
      `alter table \`slot\` add index \`slot_start_time_end_time_index\`(\`start_time\`, \`end_time\`);`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`slot\` drop index \`slot_is_active_index\`;`);
    this.addSql(`alter table \`slot\` drop index \`slot_start_time_end_time_index\`;`);
  }
}
