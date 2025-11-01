import { EntityRepository } from "@mikro-orm/mysql";
import { Branch } from "src/entities/branch.entity";

export class BranchRepository extends EntityRepository<Branch> {}
