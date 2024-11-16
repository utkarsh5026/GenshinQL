import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import WeaponMaterial from "./WeapMaterial";

@Entity()
class WeaponMaterialImages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  starLevel: number;

  @ManyToOne(() => WeaponMaterial, (material) => material.materialImages)
  weaponMaterial: WeaponMaterial;

  @Column()
  url: string;

  @Column()
  caption: string;
}

export default WeaponMaterialImages;
