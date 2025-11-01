import { Migration } from "@mikro-orm/migrations";

export class Migration20251101153318_AddedSlotNavigationForBranch extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`slot\` add \`branch_id\` varchar(255) not null;`);
        this.addSql(
            `alter table \`slot\` add constraint \`slot_branch_id_foreign\` foreign key (\`branch_id\`) references \`branch\` (\`id\`) on update cascade;`,
        );
        this.addSql(`alter table \`slot\` add index \`slot_branch_id_index\`(\`branch_id\`);`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`slot\` drop foreign key \`slot_branch_id_foreign\`;`);

        this.addSql(`alter table \`slot\` drop index \`slot_branch_id_index\`;`);
        this.addSql(`alter table \`slot\` drop column \`branch_id\`;`);
    }
}
