import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Study_Fields } from "./Study_Fields.entity";

@Entity()
export class Faculties extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  code!: string;

  @OneToMany(() => Study_Fields, (Study_Fields) => Study_Fields.faculty)
  studyFields!: Study_Fields[];
}