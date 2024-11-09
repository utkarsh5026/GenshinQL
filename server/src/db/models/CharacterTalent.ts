import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
} from "typeorm";
import TalentAnimations from "./TalentAnimations";
import Character from "./Character";

@Entity()
export default class CharacterTalent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  iconUrl: string;

  @Column()
  name: string;

  @Column()
  talentType: string;

  @Column()
  description: string;

  @OneToMany(
    () => TalentAnimations,
    (talentAnimations) => talentAnimations.characterTalent,
    { cascade: true }
  )
  talentAnimations: TalentAnimations[];

  @ManyToOne(() => Character, (character) => character.characterTalents)
  character: Character;

  @Column("simple-json")
  scaling: Record<string, string[]>;
}
