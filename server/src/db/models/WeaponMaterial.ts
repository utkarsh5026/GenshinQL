import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import Weapon from "./Weapon";

@Entity()
export default class WeaponMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  caption: string;

  @Column()
  count: number;

  @ManyToOne(() => Weapon, "materials")
  @JoinColumn({ name: "weaponId" })
  weapon: Weapon;
}
