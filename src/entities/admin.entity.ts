import { Cascade, Entity, ManyToOne, Property, Unique } from "@mikro-orm/core";
import { AdminRepository } from "../repositories/admin.repository";
import { CustomBaseEntity } from "./base.entity";
import { Branch } from "./branch.entity";

@Entity({ repository: () => AdminRepository })
export class Admin extends CustomBaseEntity {
    @Property()
    @Unique()
    email!: string;

    @Property()
    password!: string;

    @Property()
    role!: AdminRole;

    @ManyToOne(() => Branch, { nullable: true, cascade: [Cascade.PERSIST] })
    branch?: Branch;
}

export enum AdminRole {
    SUPER_ADMIN = "SUPER_ADMIN",
    BRANCH_ADMIN = "BRANCH_ADMIN",
}
