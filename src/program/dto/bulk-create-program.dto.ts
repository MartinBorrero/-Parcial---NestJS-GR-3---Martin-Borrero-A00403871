import { ArrayNotEmpty, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { CreateProgramDto } from "./create-program.dto";

// TODO Reto 3: reglas de validación con class-validator / class-transformer
//   - programs: arreglo NO vacío de CreateProgramDto
//   - cada elemento se debe validar con las mismas reglas de CreateProgramDto
//     (pista: @ValidateNested({ each: true }) + @Type(() => CreateProgramDto))
export class BulkCreateProgramDto {

    @ApiProperty({
        description: "Programs to create",
        type: () => [CreateProgramDto]
    })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => CreateProgramDto)
    programs: CreateProgramDto[];

}
