import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator";

export class ReservaAssentoDto {
    @IsString()
    @ApiProperty({ description: 'ID do assento reservado' })
    assento_id: string;

    @IsString()
    @ApiProperty({ description: 'ID do usuário para a reserva do assento' })
    usuario_id: string;

}