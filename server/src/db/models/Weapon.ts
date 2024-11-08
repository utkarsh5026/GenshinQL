import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import WeaponType from "./WeaponType";
import WeaponMaterial from "./WeaponMaterial";
import WeaponPassive from "./WeaponPassive";

@Entity()
export default class Weapon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  rarity: number;

  @Column()
  attack: number;

  @Column()
  subStat: string;

  @Column()
  effect: string;

  @ManyToOne(() => WeaponType, "weapons")
  @JoinColumn({ name: "weaponTypeId" })
  weaponType: WeaponType;

  @OneToMany(() => WeaponMaterial, "weapon")
  materials: WeaponMaterial[];

  @OneToMany(() => WeaponPassive, "weapon")
  passives: WeaponPassive[];
}