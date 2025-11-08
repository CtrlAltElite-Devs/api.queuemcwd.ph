import { Migration } from "@mikro-orm/migrations";

export class Migration20251108170351_RemovedCategoryCodeProperty extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`appointment\` drop index \`appointment_category_code_index\`;`);
        this.addSql(`alter table \`appointment\` drop column \`category_code\`;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`appointment\` add \`category_code\` varchar(255) not null;`);
        this.addSql(
            `alter table \`appointment\` add index \`appointment_category_code_index\`(\`category_code\`);`,
        );
    }
}
