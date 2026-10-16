import { ConflictException, HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { Student } from '../student/entities/student.entity';
import { User } from '../user/entities/user.entity';
import { PaginationDto } from '../student/dto/pagination.dto';
import { CreateProgramDto } from './dto/create-program.dto';
import { AssignStudentsDto } from './dto/assign-students.dto';
import { BulkCreateProgramDto } from './dto/bulk-create-program.dto';

@Injectable()
export class ProgramService {

    private readonly logger = new Logger("ProgramService");

    // TODO Reto 1: inyecta el repositorio de Program (y lo que necesites para las transacciones)
    constructor(
        @InjectRepository(Program)
        private readonly programRepository: Repository<Program>,
        private datasource: DataSource
    ){}

    // TODO Reto 1: create(createProgramDto, user) -> guarda el programa
    //   - nombre o código repetido -> 409 Conflict (no 500)
    async create(createProgramDto: CreateProgramDto, user: User){
        try{
            const program = this.programRepository.create({
                ...createProgramDto,
                createdBy: user
            });
            await this.programRepository.save(program);
            return program;
        }catch(error){
            this.handleException(error);
        }
    }

    // TODO Reto 1: findAll(paginationDto) -> lista paginada (limit / skip)
    async findAll(paginationDto: PaginationDto){
        const {skip, limit} = paginationDto;
        return await this.programRepository.find({
            take: limit,
            skip: skip
        });
    }
    // TODO Reto 2: findOne(id) -> programa con sus estudiantes, 404 si no existe
    async findOne(id: string){
        const program = await this.programRepository.findOne({
            where: { id },
            relations: { students: true }
        });

        if(!program) throw new NotFoundException(`Program with id ${id} not found`);

        return program;
    }

    // TODO Reto 2: assignStudents(id, assignStudentsDto) -> AGREGA estudiantes al programa
    //   dentro de una transacción (QueryRunner), conservando los que ya tenía.
    //   Mismo patrón del update de estudiantes corregido en clase (combinar las notas):
    //   traer los actuales -> combinar con los nuevos -> guardar la lista completa.
    //   Si algún id no existe: 404 y rollback.
    async assignStudents(id: string, assignStudentsDto: AssignStudentsDto){
        const {studentIds} = assignStudentsDto;

        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try{
            const program = await queryRunner.manager.findOne(Program, {
                where: { id },
                relations: { students: true }
            });

            if(!program) throw new NotFoundException(`Program with id ${id} not found`);

            const currentStudents = program.students ?? [];

            for(const studentId of studentIds){
                const exist = currentStudents.find( student => student.id === studentId );

                if(!exist){
                    const student = await queryRunner.manager.findOneBy(Student, { id: studentId });

                    if(!student) throw new NotFoundException(`Student with id ${studentId} not found`);

                    currentStudents.push(student);
                }
            }

            program.students = currentStudents;

            await queryRunner.manager.save(program);
            await queryRunner.commitTransaction();

        }catch(error){
            await queryRunner.rollbackTransaction();
            this.handleException(error);
        }finally{
            await queryRunner.release();
        }

        return this.findOne(id);
    }

    // TODO Reto 3: bulkCreate(bulkCreateProgramDto, user) -> crea todos los programas o ninguno
    //   (transacción). Cualquier nombre/código repetido -> 409 y rollback.
    async bulkCreate(bulkCreateProgramDto: BulkCreateProgramDto, user: User){
        const {programs} = bulkCreateProgramDto;

        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try{
            const newPrograms = programs.map( program => this.programRepository.create({
                ...program,
                createdBy: user
            }));

            const savedPrograms = await queryRunner.manager.save(newPrograms);
            await queryRunner.commitTransaction();

            return savedPrograms;

        }catch(error){
            await queryRunner.rollbackTransaction();
            this.handleException(error);
        }finally{
            await queryRunner.release();
        }
    }

    private handleException(error:any): never {
        if(error instanceof HttpException) throw error;
        this.logger.error(error);
        if(error.code === '23505'){
            throw new ConflictException(error.detail);
        }
        throw new InternalServerErrorException("Unexpected error");
    }
}
