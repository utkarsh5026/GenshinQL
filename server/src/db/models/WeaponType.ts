import { Entity, OneToMany, PrimaryGeneratedColumn, Column } from "typeorm";

import Weapon from "./Weapon";
import Character from "./Character";
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

  @OneToMany(() => Character, (character) => character.weaponType)
  characters: Character[];
}
