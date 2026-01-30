import { IsString, IsNumber, Min, IsNotEmpty, IsDateString, Matches } from 'class-validator';

export class CreateSessaoDto {
    @IsString()
    @IsNotEmpty({ message: 'O nome do filme não pode estar vazio' })
    filme: string;

    @IsString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'A data da sessão deve estar no formato YYYY-MM-DD' })
    @IsNotEmpty({ message: 'A data da sessão não deve estar vazia' })
    date: string;

    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, { message: 'O horário deve estar no formato HH:MM:SS' })
    @IsNotEmpty({ message: 'O horário da sessão não deve estar vazio' })
    horario: string;

    @IsString()
    @IsNotEmpty({ message: 'A sala não pode estar vazia' })
    sala: string;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'O preço deve ser um número válido' })
    @IsNotEmpty({ message: 'O preço não pode estar vazio' })
    preco: number;

    @Min(16, { message: 'O total de assentos deve ser pelo menos 16' })
    totalAssentos: number;
}
