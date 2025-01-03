import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import Gallery from "./Gallery";
import ScreenAnimationMedia from "./ScreenAnimationMedia";

type SCAMedia = ScreenAnimationMedia | null;

@Entity()
export default class ScreenAnimation {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ScreenAnimationMedia, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  idleOne: SCAMedia;

  @OneToOne(() => ScreenAnimationMedia, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  idleTwo: SCAMedia;

  @OneToOne(() => ScreenAnimationMedia, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  talentMenu: SCAMedia;

  @OneToOne(() => ScreenAnimationMedia, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  weaponMenu: SCAMedia;

  @OneToOne(() => ScreenAnimationMedia, {
    cascade: true,
    nullable: true,
    eager: true,
  })
  @JoinColumn()
  partySetup: SCAMedia;

  @OneToOne(() => Gallery)
  gallery: Gallery;
}
