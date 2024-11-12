import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export default class ScreenAnimationMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  imageUrl: string;

  @Column()
  videoUrl: string;

  @Column()
  caption: string;

  @Column()
  videoType: string;
}
