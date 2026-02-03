import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { SessaoService } from 'src/sessao/sessao.service';
import { ProcessandoPagamentoDto } from './dto/pagamento-payload.dto';
import { ReservaAssentoDto } from './dto/reserva-payload.dto';
import { SeedService } from 'src/seed/seed.service';
import { Repository } from 'typeorm';
import { Pagamento, StatusPagamento } from './entities/pagamento.entity';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class ReservaService {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        @Inject('PEDIDO_SERVICE') private readonly client: ClientProxy,
        private sessaoService: SessaoService,
        private seedService: SeedService,
        @InjectRepository(Pagamento) private pagamentoRepo: Repository<Pagamento>,
    ) { }

    async solicitarReserva(payload: ReservaAssentoDto) {
        const { assento_id, usuario_id } = payload;
        try {
            await this.validaAssentoEUsuario(assento_id, usuario_id);

            const cacheKey = `seat_lock:${assento_id}`;
            const existing = await this.cacheManager.get(cacheKey);

            if (existing) {
                throw new BadRequestException('Assento ocupado.');
            }

            await this.cacheManager.set(cacheKey, usuario_id, 30000);

            return { success: true, message: 'Assento reservado por 30s.' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async confirmarIntencaoCompra(payload: ReservaAssentoDto) {
        const { assento_id, usuario_id } = payload;
        try {
            this.validaAssentoEUsuario(assento_id, usuario_id);

            const cacheKey = `seat_lock:${assento_id}`;
            const reservadoPor = await this.cacheManager.get(cacheKey);

            if (!reservadoPor || reservadoPor !== usuario_id) {
                throw new BadRequestException('Reserva expirou.');
            }

            await this.cacheManager.set(cacheKey, usuario_id, 600000);

            return { success: true, message: 'Pagamento em processamento...' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async iniciandoPagamento(payload: ProcessandoPagamentoDto) {

        const { assento_id, usuario_id } = payload;

        await this.sessaoService.validaAssento(assento_id);
        await this.validaReserva(assento_id, usuario_id);

        this.client.emit('processar_pagamento', {
            ...payload,
            dataSolicitacao: new Date()
        });

        return { success: true, message: 'Pagamento processado com sucesso.' };
    }

    async cancelarIntencaoCompra(assento_id: string) {
        const cacheKey = `seat_lock:${assento_id}`;
        await this.cacheManager.del(cacheKey);
        return { success: true, message: 'Reserva cancelada.' };
    }

    async validaAssentoEUsuario(assento_id: string, usuario_id: string) {
        await this.sessaoService.validaAssento(assento_id);
        await this.seedService.validarUsuario(usuario_id);
    }

    async validaReserva(assento_id: string, usuario_id: string) {
        const cacheKey = `seat_lock:${assento_id}`;
        const reservadoPor = await this.cacheManager.get(cacheKey);

        if (!reservadoPor || reservadoPor !== usuario_id) {
            throw new BadRequestException('Reserva expirou.');
        }
    }

    async processarPagamentoExterno(dados: ProcessandoPagamentoDto): Promise<boolean> {
        try {
            const novoPagamento = this.pagamentoRepo.create({
                assento_id: dados.assento_id,
                usuario_id: dados.usuario_id,
                cartao_final: dados.card_number.slice(-4),
                titular_nome: dados.card_holder_name,
                valor: dados.valor_da_compra,
                metodo_pagamento: dados.tipo_pagamento,
                status: StatusPagamento.APROVADO,

            });
            await this.pagamentoRepo.save(novoPagamento);
            return true
        } catch (error) {
            throw new InternalServerErrorException('Erro ao processar pagamento externo.');
        }
    }
}