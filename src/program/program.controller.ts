import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ProgramService } from './program.service';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/user/decorators/auth.decorator';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { CreateProgramDto } from './dto/create-program.dto';
import { Program } from './entities/program.entity';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { PaginationDto } from 'src/student/dto/pagination.dto';

@ApiTags("Programs")
@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}

  // TODO Reto 1: POST   /api/program               -> crear programa
  // TODO Reto 1: GET    /api/program               -> listar (paginado con PaginationDto)
  // TODO Reto 2: GET    /api/program/:id           -> programa con sus estudiantes
  // TODO Reto 2: PATCH  /api/program/:id/students  -> agregar estudiantes (acumulativo)
  // TODO Reto 3: POST   /api/program/bulk          -> crear programas en lote (todo o nada)
  // TODO Reto 4: proteger los POST y el PATCH para que solo un admin pueda usarlos

 @Post()
  @Auth(ValidRoles.admin)
  @ApiOperation({ summary: "Create a program", description: "Requires the admin role" })
  @ApiCreatedResponse({ description: "Program was created", type: Program })
  @ApiBadRequestResponse({ description: "Invalid request body" })
  @ApiConflictResponse({ description: "Name or code already registered" })
  create(@Body() createProgramDto: CreateProgramDto, @GetUser() user: User){
    
    return this.programService.create(createProgramDto, user);
  }

@Get()
  @ApiOperation({ summary: "List programs", description: "Supports pagination with limit and skip" })
  @ApiOkResponse({ description: "Program's list", type: [Program] })
  @ApiBadRequestResponse({ description: "Invalid pagination params" })
  findAll(@Query() paginationDto: PaginationDto){
    return this.programService.findAll(paginationDto);
  }

}
