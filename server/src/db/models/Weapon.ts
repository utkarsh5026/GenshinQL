import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import WeaponType from "./WeaponType";
import WeaponMaterial from "./WeapMaterial";
import WeaponPassive from "./WeaponPassive";

@Entity()
export default class Weapon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  iconUrl: string;

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

  @ManyToOne(() => WeaponMaterial, (material) => material.weapons)
  material: WeaponMaterial;

  @OneToMany(() => WeaponPassive, "weapon", { cascade: true })
  passives: WeaponPassive[];
}
