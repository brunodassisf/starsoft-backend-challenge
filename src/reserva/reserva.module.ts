import { Module } from '@nestjs/common';
import { ReservaController } from './reserva.controller';
import { ReservaService } from './reserva.service';
import { PagamentoConsumer } from './pagamento.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SessaoModule } from 'src/sessao/sessao.module';
import { SeedModule } from 'src/seed/seed.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pagamento } from './entities/pagamento.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Pagamento]),
        ClientsModule.register([
            {
                name: 'PEDIDO_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: ['amqp://guest:guest@rabbitmq:5672'],
                    queue: 'pedidos_queue',
                    queueOptions: { durable: true },
                },
            },
        ]), SessaoModule, SeedModule],
    controllers: [ReservaController, PagamentoConsumer],
    providers: [ReservaService],
})
export class ReservaModule { }