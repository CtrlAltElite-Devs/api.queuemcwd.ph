import { Cascade, Collection, Entity, OneToMany, Property, Unique } from "@mikro-orm/core";
import { UpdateBranchDto } from "../modules/branch/dto/update-branch.dto";
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

    Update(dto: UpdateBranchDto) {
        if (dto.name) {
            this.name = dto.name;
        }

        if (dto.address) {
            this.address = dto.address;
        }

        if (dto.allowedTimeFrame) {
            this.allowedTimeFrame = dto.allowedTimeFrame;
        }
    }
}
