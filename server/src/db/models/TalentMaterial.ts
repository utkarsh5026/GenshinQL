import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Nation from "./Nation";

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
}
