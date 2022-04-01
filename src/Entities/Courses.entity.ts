import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Course_Professors } from "./Course_Professors.entity";
import { Faculties } from "./Faculties.entity";
import { Payments } from "./Payments.entity";
import { Student_Courses } from "./Student_Courses.entity";
import { Study_Fields } from "./Study_Fields.entity";

@Entity()
export class Courses extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  code!: string;

  @Column()
  name!: string;

  @Column()
  type!: string;

  @Column()
  category!: string;

  @Column()
  gradingSystem!: string;

  @ManyToOne(
    () => Study_Fields,
    (Study_Fields: Study_Fields) => Study_Fields.courses,
    {
      onDelete: "SET NULL",
    }
  )
  @JoinColumn()
  studyField!: Faculties;

  @OneToMany(() => Payments, (Payments: Payments) => Payments.course)
  payments!: Payments[];

  @OneToMany(
    () => Student_Courses,
    (Student_Courses: Student_Courses) => Student_Courses.course
  )
  studentCourses!: Student_Courses[];

  @OneToMany(
    () => Course_Professors,
    (Course_Professors: Course_Professors) => Course_Professors.course
  )
  courseProfessors!: Course_Professors[];
}
