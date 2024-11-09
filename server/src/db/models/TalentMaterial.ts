import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import Nation from "./Nation";
import Character from "./Character";

@Entity()
export default class TalentMaterial {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  guideUrl: string;

  @Column()
  teachingUrl: string;

  @Column()
  philosophyUrl: string;

  @Column()
  dayOne: string;

  @Column()
  dayTwo: string;

  @ManyToOne(() => Nation, (nation) => nation.talentMaterials)
  nation: Nation;

  @OneToMany(() => Character, (character) => character.talentMaterial, {
    cascade: true,
  })
  characters: Character[];
}
