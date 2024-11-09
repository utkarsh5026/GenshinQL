import { Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import NameCard from "./NameCard";
import ScreenAnimation from "./ScreenAnimation";
import AttackAnimation from "./AttackAnimation";
import Character from "./Character";

@Entity()
export default class Gallery {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ScreenAnimation, { cascade: true })
  @JoinColumn()
  screenAnimation: ScreenAnimation;

  @OneToOne(() => NameCard, { cascade: true })
  @JoinColumn()
  nameCard: NameCard;

  @OneToOne(() => AttackAnimation, { cascade: true })
  @JoinColumn()
  attackAnimation: AttackAnimation;

  @OneToOne(() => Character, (character) => character.gallery)
  character: Character;
}
