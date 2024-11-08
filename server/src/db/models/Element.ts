import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import Character from "./Character";

@Entity()
export default class Element {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  iconUrl: string;

  @OneToMany(() => Character, (character) => character.element)
  characters: Character[];
}
