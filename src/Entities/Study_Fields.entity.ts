import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Courses } from "./Courses.entity";
import { Faculties } from "./Faculties.entity";
import { Students } from "./Students.entity";

@Entity()
export class Study_Fields extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  code!: string;

  @Column()
  type!: string;

  @Column()
  ects!: number;

  @Column()
  yearsNumber!: string;

  @Column()
  semestersNumber!: string;

  @ManyToOne(() => Faculties, (Faculties: Faculties) => Faculties.studyFields, {
    onDelete: "SET NULL",
  })
  @JoinColumn()
  faculty!: Faculties;

  @OneToMany(() => Students, (Students: Students) => Students.studyField)
  students!: Students[];

  @OneToMany(() => Courses, (Courses: Courses) => Courses.studyField)
  courses!: Courses[];
}
