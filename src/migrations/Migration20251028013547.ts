import { Migration } from "@mikro-orm/migrations";

export class Migration20251028013547 extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` drop index \`appointment_date_validity_queue_status_index\`;`,
        );

        this.addSql(
            `alter table \`appointment\` add index \`appointment_queue_status_date_validity_index\`(\`queue_status\`, \`date_validity\`);`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` drop index \`appointment_queue_status_date_validity_index\`;`,
        );

        this.addSql(
            `alter table \`appointment\` add index \`appointment_date_validity_queue_status_index\`(\`date_validity\`, \`queue_status\`);`,
        );
    }
}
