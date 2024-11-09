import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Gallery from "./Gallery";

@Entity()
export default class AttackAnimation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  normalAttack: string;

  @Column()
  elementalSkill: string;

  @Column()
  elementalBurst: string;

  @OneToOne(() => Gallery)
  gallery: Gallery;
}
