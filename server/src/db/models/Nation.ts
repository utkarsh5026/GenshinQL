import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import TalentMaterial from "./TalentMaterial";
import Character from "./Character";
import WeaponMaterial from "./WeapMaterial";

@Entity()
export default class Nation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  iconUrl: string;

  @OneToMany(() => TalentMaterial, (talentMaterial) => talentMaterial.nation)
  talentMaterials: TalentMaterial[];

  @OneToMany(() => Character, (character) => character.nation)
  characters: Character[];

  @OneToMany(() => WeaponMaterial, (weaponMaterial) => weaponMaterial.nation)
  weaponMaterials: WeaponMaterial[];
}
