import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import Weapon from "./Weapon";

@Entity()
export default class WeaponPassive {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @ManyToOne(() => Weapon, "passives")
  @JoinColumn({ name: "weaponId" })
  weapon: Weapon;
}
