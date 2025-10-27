import { EntityRepository } from "@mikro-orm/mysql";
import { Slot } from "src/entities/slot.entity";

export class SlotsRepository extends EntityRepository<Slot>{
    
}