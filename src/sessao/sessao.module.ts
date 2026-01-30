import { Module } from '@nestjs/common';
import { SessaoService } from './sessao.service';
import { SessaoController } from './sessao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assento, Sessao } from './entities/sessao.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sessao, Assento])],
  controllers: [SessaoController],
  providers: [SessaoService],
})
export class SessaoModule { }
