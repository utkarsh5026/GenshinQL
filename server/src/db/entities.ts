import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

@Entity()
export class Element {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  iconUrl: string;
}

@Entity()
export class WeaponType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  iconUrl: string;
}

@Entity()
export class Nation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  iconUrl: string;
}

@Entity()
export class Weapon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  rarity: number;

  @Column()
  attack: number;

  @ManyToOne(() => WeaponType)
  @JoinColumn({ name: "weaponTypeId" })
  weaponType: WeaponType;
}
