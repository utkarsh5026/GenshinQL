import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import CharacterTalent from "./CharacterTalent";

@Entity()
export default class TalentAnimations {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  caption: string;

  @ManyToOne(
    () => CharacterTalent,
    (characterTalent) => characterTalent.talentAnimations
  )
  characterTalent: CharacterTalent;
}
