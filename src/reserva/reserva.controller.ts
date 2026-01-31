import { Controller, Post, Body, Param, Get, Delete } from '@nestjs/common';
import { ReservaService } from './reserva.service';

@Controller('reserva')
export class ReservaController {
    constructor(private readonly reservaService: ReservaService) { }

    @Post('assento/:id')
    async reserve(@Param('id') assentoId: string, @Body('userId') userId: string) {
        return await this.reservaService.solicitarReserva(assentoId, userId);
    }

}