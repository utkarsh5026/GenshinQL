import { Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import NameCard from "./NameCard";
import ScreenAnimation from "./ScreenAnimation";
import AttackAnimation from "./AttackAnimation";
import Character from "./Character";

@Entity()
export default class Gallery {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ScreenAnimation)
  @JoinColumn()
  screenAnimation: ScreenAnimation;

  @OneToOne(() => NameCard)
  @JoinColumn()
  nameCard: NameCard;

  @OneToOne(() => AttackAnimation)
  @JoinColumn()
  attackAnimation: AttackAnimation;

  @OneToOne(() => Character, (character) => character.gallery)
  character: Character;
}
