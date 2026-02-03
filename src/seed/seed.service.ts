import { BadRequestException, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Sessao } from 'src/sessao/entities/sessao.entity';
import { SessaoService } from 'src/sessao/sessao.service';
import { Pagamento } from 'src/reserva/entities/pagamento.entity';


@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Sessao) private sessaoRepository: Repository<Sessao>,
        @InjectRepository(Pagamento) private pagamentoRepository: Repository<Pagamento>,
        private sessaoService: SessaoService,
    ) { }

    async onModuleInit() {
        await this.seed();
    }

    async seed() {
        const existingUsers = await this.userRepository.count();
        const existingSessoes = await this.sessaoRepository.count();
        if (existingUsers > 0 && existingSessoes > 0) {
            this.logger.log('Banco de dados já contém dados.');
            return;
        }
        try {
            await this.seedUser();
            await this.seedSessao();
            this.logger.log('Seed concluído com sucesso!');
        } catch (error) {
            this.logger.error('Erro ao executar seed:', error);
        }
    }

    private async seedUser() {
        const users = [
            {
                nome: 'Bruno de Assis',
            },
            {
                nome: 'Gabriel Batista',
            },
        ];
        await this.userRepository.save(users);
    }

    private async seedSessao() {
        const sessao = {
            "filme": "AVATAR: FOGO E CINZAS",
            "date": "2026-01-24",
            "horario": "15:30:00",
            "sala": "A",
            "preco": 25.00,
            "totalAssentos": 16
        }
        await this.sessaoService.criarSessao(sessao);
    }

    async listAllUsers() {
        return this.userRepository.find()
    }

    async historicoComprasUsuario(user_id: string) {
        const user = await this.pagamentoRepository.find({ where: { usuario_id: user_id } });
        if (!user || user.length === 0) {
            throw new BadRequestException('Usuário não encontrado ou sem histórico de compras.');
        }
        return user;
    }

    async validarUsuario(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('Usuário não encontrado.');
        }
    }
}