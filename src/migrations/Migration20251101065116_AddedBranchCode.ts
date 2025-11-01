import { Migration } from "@mikro-orm/migrations";

export class Migration20251101065116_AddedBranchCode extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`branch\` drop index \`branch_name_unique\`;`);

        this.addSql(`alter table \`branch\` add \`branch_code\` varchar(255) not null;`);
        this.addSql(
            `alter table \`branch\` add unique \`branch_branch_code_unique\`(\`branch_code\`);`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`branch\` drop index \`branch_branch_code_unique\`;`);
        this.addSql(`alter table \`branch\` drop column \`branch_code\`;`);

        this.addSql(`alter table \`branch\` add unique \`branch_name_unique\`(\`name\`);`);
    }
}
