import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from "typeorm";
import Weapon from "./Weapon";
import Nation from "./Nation";
import WeaponMaterialImages from "./WeaponMaterialImages";

@Entity()
export default class WeaponMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayOne: string;

  @Column()
  dayTwo: string;

  @OneToMany(() => Weapon, (weapon) => weapon.material)
  weapons: Weapon[];

  @ManyToOne(() => Nation, (nation) => nation.weaponMaterials)
  nation: Nation;

  @OneToMany(() => WeaponMaterialImages, (image) => image.weaponMaterial, {
    cascade: true,
  })
  materialImages: WeaponMaterialImages[];
}
