import { Migration } from "@mikro-orm/migrations";

export class Migration20251101100306_ChangedUsernameToEmailForAdmin extends Migration {
    override async up(): Promise<void> {
        this.addSql(`alter table \`admin\` drop index \`admin_username_unique\`;`);

        this.addSql(`alter table \`admin\` change \`username\` \`email\` varchar(255) not null;`);
        this.addSql(`alter table \`admin\` add unique \`admin_email_unique\`(\`email\`);`);
    }

    override async down(): Promise<void> {
        this.addSql(`alter table \`admin\` drop index \`admin_email_unique\`;`);

        this.addSql(`alter table \`admin\` change \`email\` \`username\` varchar(255) not null;`);
        this.addSql(`alter table \`admin\` add unique \`admin_username_unique\`(\`username\`);`);
    }
}
