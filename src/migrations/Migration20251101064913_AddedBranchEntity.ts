import { Migration } from "@mikro-orm/migrations";

export class Migration20251101064913_AddedBranchEntity extends Migration {
    override async up(): Promise<void> {
        this.addSql(
            `create table \`branch\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`name\` varchar(255) not null, \`address\` varchar(255) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
        );
        this.addSql(`alter table \`branch\` add unique \`branch_name_unique\`(\`name\`);`);

        this.addSql(
            `alter table \`admin\` add \`role\` varchar(255) not null, add \`branch_id\` varchar(255) not null;`,
        );
        this.addSql(
            `alter table \`admin\` add constraint \`admin_branch_id_foreign\` foreign key (\`branch_id\`) references \`branch\` (\`id\`) on update cascade;`,
        );
        this.addSql(`alter table \`admin\` add index \`admin_branch_id_index\`(\`branch_id\`);`);

        this.addSql(`alter table \`slot\` modify \`limit\` int not null default 1;`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`admin\` drop foreign key \`admin_branch_id_foreign\`;`);

        this.addSql(`drop table if exists \`branch\`;`);

        this.addSql(`alter table \`admin\` drop index \`admin_branch_id_index\`;`);
        this.addSql(`alter table \`admin\` drop column \`role\`, drop column \`branch_id\`;`);

        this.addSql(`alter table \`slot\` modify \`limit\` int not null default 10;`);
    }
}
