import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Gallery from "./Gallery";

@Entity()
export default class NameCard {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  background: string;

  @Column()
  icon: string;

  @Column()
  banner: string;

  @OneToOne(() => Gallery)
  gallery: Gallery;
}
