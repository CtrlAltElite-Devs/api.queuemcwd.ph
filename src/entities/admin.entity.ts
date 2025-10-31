import { Entity, Property, Unique } from "@mikro-orm/core";
import { CustomBaseEntity } from "./base.entity";

@Entity()
export class Admin extends CustomBaseEntity {
  @Property()
  @Unique()
  username!: string;

  @Property()
  password!: string;
}
