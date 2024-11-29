import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Gallery from "./Gallery";

@Entity()
export default class PaimonPaintings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @ManyToOne(() => Gallery, (gallery) => gallery.paimonPaintings)
  gallery: Gallery;
}
