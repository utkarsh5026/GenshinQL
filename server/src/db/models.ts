import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Nation {
  @PrimaryColumn()
  name: string;

  @Column()
  imageUrl: string;

  @OneToMany(() => TalentBook, (talentBook) => talentBook.nation)
  talentBooks: TalentBook[];

  @OneToMany(() => Character, (character) => character.nation)
  characters: Character[];
}

@Entity()
export class WeaponType {
  @PrimaryColumn()
  weaponType: string;

  @Column()
  iconUrl: string;

  @OneToMany(() => Character, (character) => character.weaponType)
  characters: Character[];
}

@Entity()
export class TalentBook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  teachingUrl: string;

  @Column()
  guideUrl: string;

  @Column()
  philosophiesUrl: string;

  @ManyToOne(() => Nation, (nation) => nation.talentBooks)
  nation: Nation;

  @OneToMany(() => Character, (character) => character.talentBook)
  characters: Character[];

  @Column()
  dayOne: string;

  @Column()
  dayTwo: string;
}

@Entity()
export class Element {
  @PrimaryColumn()
  name: string;

  @Column()
  imageUrl: string;

  @OneToMany(() => Character, (character) => character.element)
  characters: Character[];
}

@Entity()
export class Character {
  @PrimaryColumn()
  name: string;

  @Column()
  rarity: number;

  @ManyToOne(() => Nation, (nation) => nation.characters)
  nation: Nation;

  @ManyToOne(() => Element, (element) => element.characters)
  element: Element;

  @ManyToOne(() => WeaponType, (weaponType) => weaponType.characters)
  weaponType: WeaponType;

  @OneToMany(
    () => CharacterTalent,
    (characterTalent) => characterTalent.character,
    { cascade: true }
  )
  talents: CharacterTalent[];

  @OneToMany(() => Constellation, (constellation) => constellation.character)
  constellations: Constellation[];

  @ManyToOne(() => TalentBook, (talentBook) => talentBook.characters)
  talentBook: TalentBook;
}

@Entity()
export class CharacterTalent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column({ type: "text" })
  description: string;

  @Column()
  type: string;

  @OneToMany(() => ImageUrls, (imageUrls) => imageUrls.caption)
  figureUrls: ImageUrls[];

  @Column("simple-json")
  scaling: Record<string, string[]>;

  @ManyToOne(() => Character, (character) => character.talents)
  character: Character;
}

@Entity()
export class Constellation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: number;

  @Column()
  description: string;

  @OneToOne(() => ImageUrls, (imageUrls) => imageUrls.constellation)
  @JoinColumn()
  iconUrl: ImageUrls;

  @ManyToOne(() => Character, (character) => character.constellations)
  character: Character;
}

@Entity()
export class ImageUrls {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column()
  caption: string;

  @ManyToOne(
    () => CharacterTalent,
    (characterTalent) => characterTalent.figureUrls
  )
  characterTalent: CharacterTalent;

  @OneToOne(() => Constellation, (constellation) => constellation.iconUrl)
  constellation: Constellation;
}

@Entity()
export class ScreenAnimation {}
