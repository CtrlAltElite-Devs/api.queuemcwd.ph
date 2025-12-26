import { Cascade, Collection, Entity, OneToMany, Property, Unique } from "@mikro-orm/core";
import { BranchRepository } from "../repositories/branch.repository";
import { Admin } from "./admin.entity";
import { CustomBaseEntity } from "./base.entity";
import { MonthDay } from "./monthDay.entity";

@Entity({ repository: () => BranchRepository })
export class Branch extends CustomBaseEntity {
    @Property()
    name!: string;

    @Property()
    @Unique()
    branchCode!: string;

    @Property()
    address!: string;

    @Property({ comment: "in day format" })
    allowedTimeFrame: number = 7;

    @OneToMany(() => Admin, (a) => a.branch)
    admins = new Collection<Admin>(this);

    @OneToMany(() => MonthDay, (md) => md.branch, { cascade: [Cascade.PERSIST] })
    monthDays = new Collection<MonthDay>(this);
}
