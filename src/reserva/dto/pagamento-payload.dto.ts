import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsCreditCard, Length, IsNumber, Min, Matches, IsEnum } from 'class-validator';

export class PagamentoPayload {
    @IsEnum(['credito', 'debito'], { message: 'Selecione o método de pagamento.' })
    @ApiProperty({ description: 'Tipo de pagamento (credito ou debito)' })
    tipo_pagamento: string;

    @IsCreditCard({ message: 'Número de cartão inválido.' })
    @ApiProperty({ description: 'Número do cartão de crédito ou débito', example: '5567 2588 2849 3948' })
    card_number: string;

    @Matches(/^[0-9]{3,4}$/, { message: 'CVV deve ter 3 ou 4 dígitos numéricos.' })
    @ApiProperty({ description: 'CVV do cartão', example: '123' })
    card_cvv: string;

    @Matches(/^(0[1-9]|1[0-2])$/, { message: 'Mês de expiração inválido (01-12).' })
    @ApiProperty({ description: 'Mês de expiração', example: '10' })
    card_expiration_month: string;

    @Matches(/^20[2-9][0-9]$/, { message: 'Ano de expiração inválido.' })
    @ApiProperty({ description: 'Ano de expiração', example: '2030' })
    card_expiration_year: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 50)
    @ApiProperty({ description: 'Nome do titular do cartão de crédito ou débito' })
    card_holder_name: string;
}


export class ProcessandoPagamentoDto extends PagamentoPayload {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'ID do usuário que fez a reserva do assento' })
    usuario_id: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'ID do assento para a reserva' })
    assento_id: string;

    @IsNumber()
    @Min(0.01)
    @ApiProperty({ description: 'Valor da compra' })
    valor_da_compra: number;
}

export class PagamentoProcessadoPayload extends ProcessandoPagamentoDto {
    dataSolicitacao: Date;
}
