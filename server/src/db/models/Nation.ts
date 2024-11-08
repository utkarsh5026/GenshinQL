import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class Nation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  iconUrl: string;
}
