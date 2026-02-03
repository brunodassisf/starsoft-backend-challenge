import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateSessaoDto } from './dto/create-sessao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sessao, Assento, StatusAssento } from './entities/sessao.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class SessaoService {
  constructor(
    @InjectRepository(Sessao)
    private sessoesRepository: Repository<Sessao>,
    @InjectRepository(Assento)
    private assentoRepo: Repository<Assento>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async criarSessao(createSessaoDto: CreateSessaoDto) {
    const { totalAssentos, ...data } = createSessaoDto;

    try {
      const novaSessao = this.sessoesRepository.create({
        ...data
      });

      const assentos: Assento[] = [];
      const assentosPorFila = 4;

      for (let i = 0; i < totalAssentos; i++) {
        const letraFila = String.fromCharCode(65 + Math.floor(i / assentosPorFila));
        const numeroAssento = (i % assentosPorFila) + 1;

        const assento = this.assentoRepo.create({
          posicao: `${letraFila}${numeroAssento}`,
          status: StatusAssento.DISPONIVEL,
          usuario_id: novaSessao.id
        });

        assentos.push(assento);
      }

      novaSessao.mapa_assentos = assentos;

      await this.sessoesRepository.save(novaSessao);

      return {
        success: true,
        message: `Sessão ${novaSessao.filme} para o dia ${novaSessao.date} às ${novaSessao.horario}, criada com sucesso`
      };

    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw new InternalServerErrorException(
        'Não foi possível criar a sessão. Verifique os dados e tente novamente.'
      );
    }
  }

  async listarTodasSessoes() {
    const sessoes = await this.sessoesRepository.find({
      relations: ['mapa_assentos'],
      order: {
        mapa_assentos: {
          posicao: 'ASC'
        }
      }
    });

    const listSessoes = []

    for (const sessao of sessoes) {
      const mapaPromessas = sessao.mapa_assentos.map(async (assento) => {
        const cacheKey = `seat_lock:${assento.id}`;
        const reservaAtiva: string = await this.cacheManager.get(cacheKey) || '';

        if (reservaAtiva) {
          return {
            ...assento,
            status: StatusAssento.OCUPADO,
            usuario_id: reservaAtiva,
          };
        }

        return assento;
      });

      sessao.mapa_assentos = await Promise.all(mapaPromessas);

      listSessoes.push(sessao);
    }

    return listSessoes
  }

  async sessaoPorId(sessaoId: string) {
    const sessao = await this.sessoesRepository.findOne({
      where: { id: sessaoId },
      relations: ['mapa_assentos'],
      order: {
        mapa_assentos: {
          posicao: 'ASC'
        }
      }
    });

    if (!sessao) return null;

    const mapaPromessas = sessao.mapa_assentos.map(async (assento) => {
      const cacheKey = `seat_lock:${assento.id}`;
      const reservaAtiva: string = await this.cacheManager.get(cacheKey) || '';

      if (reservaAtiva) {
        return {
          ...assento,
          status: StatusAssento.OCUPADO,
          usuario_id: reservaAtiva,
        };
      }

      return assento;
    });

    sessao.mapa_assentos = await Promise.all(mapaPromessas);

    return sessao;
  }

  async validaAssento(assentoId: string) {
    const assentoExiste = await this.sessoesRepository.findOne({
      where: { mapa_assentos: { id: assentoId } },
    });

    if (!assentoExiste) {
      throw new BadRequestException('Assento não existe.');
    }
  }

  async atualizandoStatusAssento(assento_id: string, usuario_id: string, status: StatusAssento) {
    const assento = await this.assentoRepo.findOneBy({ id: assento_id });

    if (!assento) {
      throw new NotFoundException('Assento não encontrado');
    }

    assento.usuario_id = usuario_id;
    assento.status = status;

    return await this.assentoRepo.save(assento);
  }

}
