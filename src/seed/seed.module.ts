import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from './entities/user.entity';
import { SeedController } from './seed.controller';
import { Sessao } from 'src/sessao/entities/sessao.entity';
import { SessaoModule } from 'src/sessao/sessao.module';

@Module({
    imports: [TypeOrmModule.forFeature([User, Sessao]), SessaoModule],
    providers: [SeedService],
    exports: [SeedService],
    controllers: [SeedController],
})
export class SeedModule { }
