import { Migration } from "@mikro-orm/migrations";

export class Migration20251101152234_AddedBranchNavigationToAppointment extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`appointment\` add \`branch_id\` varchar(255) not null;`);
        this.addSql(
            `alter table \`appointment\` add constraint \`appointment_branch_id_foreign\` foreign key (\`branch_id\`) references \`branch\` (\`id\`) on update cascade;`,
        );
        this.addSql(
            `alter table \`appointment\` add index \`appointment_branch_id_index\`(\`branch_id\`);`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(
            `alter table \`appointment\` drop foreign key \`appointment_branch_id_foreign\`;`,
        );

        this.addSql(`alter table \`appointment\` drop index \`appointment_branch_id_index\`;`);
        this.addSql(`alter table \`appointment\` drop column \`branch_id\`;`);
    }
}
