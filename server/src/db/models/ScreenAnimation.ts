import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm";
import Gallery from "./Gallery";

@Entity()
export default class ScreenAnimation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  idleOne: string;

  @Column()
  idleTwo: string;

  @Column()
  talentMenu: string;

  @Column()
  weaponMenu: string;

  @Column()
  partySetup: string;

  @OneToOne(() => Gallery)
  gallery: Gallery;
}
