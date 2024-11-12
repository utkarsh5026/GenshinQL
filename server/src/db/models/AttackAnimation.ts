import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import Gallery from "./Gallery";
import { animationSchema } from "../../data/schema";
import { z } from "zod";

type Animation = z.infer<typeof animationSchema>;

@Entity()
export default class AttackAnimation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("simple-json")
  normalAttack: Animation[];

  @Column("simple-json")
  elementalSkill: Animation[];

  @Column("simple-json")
  elementalBurst: Animation[];

  @OneToOne(() => Gallery)
  gallery: Gallery;
}
