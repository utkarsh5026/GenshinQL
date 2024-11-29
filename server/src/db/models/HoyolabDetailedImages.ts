import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Gallery from "./Gallery";

@Entity()
export default class HoyolabDetailedImages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Gallery, (gallery) => gallery.detailedImages)
  gallery: Gallery;
}
