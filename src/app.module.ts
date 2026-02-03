import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SessaoModule } from './sessao/sessao.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sessao, Assento } from './sessao/entities/sessao.entity';
import { SeedModule } from './seed/seed.module';
import { User } from './seed/entities/user.entity';
import { ReservaModule } from './reserva/reserva.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { Pagamento } from './reserva/entities/pagamento.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [Sessao, Assento, User, Pagamento],
        synchronize: true,
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: 'redis',
            port: 6379,
          },
        }),
      }),
    }),
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
    ]),
    SessaoModule,
    SeedModule,
    ReservaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
