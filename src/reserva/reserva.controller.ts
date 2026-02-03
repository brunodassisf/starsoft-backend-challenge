import { Controller, Post, Body, Param } from '@nestjs/common';
import { ReservaService } from './reserva.service';
import { ReservaAssentoDto } from './dto/reserva-payload.dto';
import { ProcessandoPagamentoDto } from './dto/pagamento-payload.dto';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('reserva')
export class ReservaController {
    constructor(private readonly reservaService: ReservaService) { }

    @Post('assento')
    @ApiOperation({
        summary: 'Reserva um assento',
        description: 'Este endpoint reserva um assento específico para um usuário por 30 segundos.'
    })
    @ApiBody({ type: ReservaAssentoDto })
    async reservar(@Body() payload: ReservaAssentoDto) {
        return await this.reservaService.solicitarReserva(payload);
    }

    @Post('confirmar-intencao')
    @ApiOperation({
        summary: 'Confirma a intenção de reserva',
        description: 'Este endpoint confirma a intenção de compra de um assento. Extendendo o tempo de reserva.'
    })
    @ApiBody({ type: ReservaAssentoDto })
    async confirmarIntencaoReserva(@Body() payload: ReservaAssentoDto) {
        return await this.reservaService.confirmarIntencaoCompra(payload);
    }

    @Post('cancelar-intencao')
    @ApiOperation({
        summary: 'Cancela a intenção de reserva',
        description: 'Este endpoint cancela a intenção de reserva de um assento. Caso o usuário desista da compra.'
    })
    async cancelarIntencaoReserva(@Body() assento_id: string) {
        return await this.reservaService.cancelarIntencaoCompra(assento_id);
    }

    @Post('pagamento')
    @ApiOperation({
        summary: 'Inicia o processo de pagamento',
        description: 'Este endpoint inicia o processo de pagamento para uma reserva.'
    })
    @ApiBody({ type: ProcessandoPagamentoDto })
    async iniciarPagamento(@Body() payload: ProcessandoPagamentoDto) {
        return await this.reservaService.iniciandoPagamento(payload);
    }
}