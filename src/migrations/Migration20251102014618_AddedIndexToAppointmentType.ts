import { Migration } from "@mikro-orm/migrations";

export class Migration20251102014618_AddedIndexToAppointmentType extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` add index \`appointment_appointment_type_index\`(\`appointment_type\`);`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` drop index \`appointment_appointment_type_index\`;`,
        );
    }
}
