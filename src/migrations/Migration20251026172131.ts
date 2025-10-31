import { Migration } from "@mikro-orm/migrations";

export class Migration20251026172131 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table \`admin\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`username\` varchar(255) not null, \`password\` varchar(255) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );
    this.addSql(`alter table \`admin\` add unique \`admin_username_unique\`(\`username\`);`);

    this.addSql(
      `create table \`month_day\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`month\` int not null, \`year\` int not null, \`is_working_day\` tinyint(1) not null default true, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );

    this.addSql(
      `create table \`slot\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`start_time\` datetime not null, \`end_time\` datetime not null, \`is_active\` tinyint(1) not null default true, \`limit\` int not null default 10, \`month_day_id\` varchar(255) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );
    this.addSql(`alter table \`slot\` add index \`slot_month_day_id_index\`(\`month_day_id\`);`);

    this.addSql(
      `create table \`appointment\` (\`id\` varchar(255) not null, \`created_at\` datetime not null, \`updated_at\` datetime not null, \`appointment_code\` varchar(255) not null, \`date_validity\` datetime not null, \`category_code\` tinyint not null, \`queue_status\` tinyint not null, \`age\` int not null, \`slot_id\` varchar(255) not null, primary key (\`id\`)) default character set utf8mb4 engine = InnoDB;`,
    );
    this.addSql(
      `alter table \`appointment\` add unique \`appointment_appointment_code_unique\`(\`appointment_code\`);`,
    );
    this.addSql(
      `alter table \`appointment\` add index \`appointment_slot_id_index\`(\`slot_id\`);`,
    );

    this.addSql(
      `alter table \`slot\` add constraint \`slot_month_day_id_foreign\` foreign key (\`month_day_id\`) references \`month_day\` (\`id\`) on update cascade;`,
    );

    this.addSql(
      `alter table \`appointment\` add constraint \`appointment_slot_id_foreign\` foreign key (\`slot_id\`) references \`slot\` (\`id\`) on update cascade;`,
    );
  }
}
