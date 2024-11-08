import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Element {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  iconUrl: string;
}
