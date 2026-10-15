import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { Student } from "../../student/entities/student.entity";
import { User } from "../../user/entities/user.entity";

// TODO Reto 1: convierte esta clase en una entidad de TypeORM (tabla "program") con:
//   - id: UUID generado automáticamente
//   - name: text, único
//   - code: text, único
//   - credits: int
// TODO Reto 2: relación 1:N con Student -> propiedad `students?: Student[]`
// TODO Reto 4: relación N:1 con User -> propiedad `createdBy?: User` (el admin que lo creó)
//
// Usa imports relativos (ej. "../../student/entities/student.entity"), no "src/...":
// Jest no resuelve el alias "src/" y el test de Student dejaría de correr.
@Entity()
export class Program {

    @ApiProperty({
        example: "4fcfc5ab-7902-478f-b173-b8f1e751af12",
        description: "Program id (UUID)",
        format: "uuid"
    })
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ApiProperty({
        example: "Ingenieria de Sistemas",
        description: "Program's name (unique)"
    })
    @Column({
        type: "text",
        unique: true
    })
    name: string;

    @ApiProperty({
        example: "SIS",
        description: "Program's code (unique)"
    })
    @Column({
        type: "text",
        unique: true
    })
    code: string;

    @ApiProperty({
        example: 160,
        description: "Program's credits"
    })
    @Column("int")
    credits: number;

    @ApiProperty({
        description: "Program's students",
        type: () => [Student],
        required: false
    })
    @OneToMany(
        () => Student,
        (student) => student.program
    )
    students?: Student[];

    @ApiHideProperty()
    @ManyToOne(
        () => User,
        { nullable: true }
    )
    createdBy?: User;

}
