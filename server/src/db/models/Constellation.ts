import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import Character from "./Character";

@Entity()
export default class Constellation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  iconUrl: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  level: number;

  @ManyToOne(() => Character, (character) => character.constellations)
  character: Character;
}
