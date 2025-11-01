import { Migration } from "@mikro-orm/migrations";

export class Migration20251101101123_MadeAdminBranchNullable extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`admin\` drop foreign key \`admin_branch_id_foreign\`;`);

        this.addSql(`alter table \`admin\` modify \`branch_id\` varchar(255) null;`);
        this.addSql(
            `alter table \`admin\` add constraint \`admin_branch_id_foreign\` foreign key (\`branch_id\`) references \`branch\` (\`id\`) on update cascade on delete set null;`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`admin\` drop foreign key \`admin_branch_id_foreign\`;`);

        this.addSql(`alter table \`admin\` modify \`branch_id\` varchar(255) not null;`);
        this.addSql(
            `alter table \`admin\` add constraint \`admin_branch_id_foreign\` foreign key (\`branch_id\`) references \`branch\` (\`id\`) on update cascade;`,
        );
    }
}
