import { Migration } from "@mikro-orm/migrations";

export class Migration20251101081816_AddedBranchRelevantIndices extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`month_day\` drop index \`month_day_year_month_day_index\`;`);
        this.addSql(`alter table \`month_day\` drop index \`month_day_year_month_index\`;`);

        this.addSql(`alter table \`month_day\` add \`branch_id\` varchar(255) not null;`);
        this.addSql(
            `alter table \`month_day\` add constraint \`month_day_branch_id_foreign\` foreign key (\`branch_id\`) references \`branch\` (\`id\`) on update cascade;`,
        );
        this.addSql(
            `alter table \`month_day\` add index \`month_day_branch_id_index\`(\`branch_id\`);`,
        );
        this.addSql(
            `alter table \`month_day\` add index \`month_day_branch_id_year_month_day_index\`(\`branch_id\`, \`year\`, \`month\`, \`day\`);`,
        );
        this.addSql(
            `alter table \`month_day\` add index \`month_day_branch_id_year_month_index\`(\`branch_id\`, \`year\`, \`month\`);`,
        );
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`month_day\` drop foreign key \`month_day_branch_id_foreign\`;`);

        this.addSql(`alter table \`month_day\` drop index \`month_day_branch_id_index\`;`);
        this.addSql(
            `alter table \`month_day\` drop index \`month_day_branch_id_year_month_day_index\`;`,
        );
        this.addSql(
            `alter table \`month_day\` drop index \`month_day_branch_id_year_month_index\`;`,
        );
        this.addSql(`alter table \`month_day\` drop column \`branch_id\`;`);

        this.addSql(
            `alter table \`month_day\` add index \`month_day_year_month_day_index\`(\`year\`, \`month\`, \`day\`);`,
        );
        this.addSql(
            `alter table \`month_day\` add index \`month_day_year_month_index\`(\`year\`, \`month\`);`,
        );
    }
}
