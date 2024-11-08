import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Column } from "typeorm";
import Weapon from "./Weapon";

@Entity()
export default class WeaponType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  iconUrl: string;

  @OneToMany(() => Weapon, "weaponType")
  weapons: Weapon[];
}
