import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SessaoService } from '../sessao/sessao.service';
import { PagamentoPayload, PagamentoProcessadoPayload, ProcessandoPagamentoDto } from './dto/pagamento-payload.dto';
import { StatusAssento } from 'src/sessao/entities/sessao.entity';
import { ReservaService } from './reserva.service';

@Controller()
export class PagamentoConsumer {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly sessaoService: SessaoService,
        private readonly reservaService: ReservaService,
    ) { }

    @EventPattern('processar_pagamento')
    async handleProcessarPagamento(@Payload() data: ProcessandoPagamentoDto, @Ctx() context: RmqContext) {
        const { assento_id, usuario_id } = data;
        const cacheKey = `seat_lock:${assento_id}`;

        console.log(`[RabbitMQ] 📩 Mensagem recebida: Processando pagamento do assento ${assento_id}`);

        try {
            const pagamentoAprovado = await this.reservaService.processarPagamentoExterno(data);

            if (pagamentoAprovado) {
                await this.sessaoService.atualizandoStatusAssento(assento_id, usuario_id, StatusAssento.OCUPADO);

                await this.cacheManager.del(cacheKey);

                console.log(`[RabbitMQ] ✅ Sucesso: Assento ${assento_id} reservado permanentemente.`);
            } else {
                throw new Error('Pagamento recusado pelo banco.');
            }
        } catch (error) {
            console.error(`[RabbitMQ] ❌ Erro no processamento: ${error.message}`);

            await this.cacheManager.del(cacheKey);
        }
    }
}