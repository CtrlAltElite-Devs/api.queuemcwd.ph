import { EntityRepository } from "@mikro-orm/mysql";
import { Admin } from "src/entities/admin.entity";

export class AdminRepository extends EntityRepository<Admin> {}
