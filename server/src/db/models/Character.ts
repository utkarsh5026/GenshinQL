import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import Nation from "./Nation";
import WeaponType from "./WeaponType";
import Element from "./Element";
import CharacterTalent from "./CharacterTalent";
import Constellation from "./Constellation";
import TalentMaterial from "./TalentMaterial";
@Entity()
export default class Character {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  rarity: string;

  @ManyToOne(() => Nation, (nation) => nation.characters)
  nation: Nation;

  @ManyToOne(() => WeaponType, (weaponType) => weaponType.characters)
  weaponType: WeaponType;

  @ManyToOne(() => Element, (element) => element.characters)
  element: Element;

  @OneToMany(
    () => CharacterTalent,
    (characterTalent) => characterTalent.character,
    { cascade: true }
  )
  characterTalents: CharacterTalent[];

  @OneToMany(() => Constellation, (constellation) => constellation.character, {
    cascade: true,
  })
  constellations: Constellation[];

  @ManyToOne(
    () => TalentMaterial,
    (talentMaterial) => talentMaterial.characters
  )
  talentMaterial: TalentMaterial;
}
