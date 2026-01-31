import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateSessaoDto } from './dto/create-sessao.dto';
import { UpdateSessaoDto } from './dto/update-sessao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sessao, Assento } from './entities/sessao.entity';

@Injectable()
export class SessaoService {
  constructor(
    @InjectRepository(Sessao)
    private sessoesRepository: Repository<Sessao>,
    @InjectRepository(Assento)
    private assentoRepo: Repository<Assento>,
  ) { }

  async create(createSessaoDto: CreateSessaoDto) {
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
          status: 'disponivel',
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

  async findById(sessaoId: string) {
    return this.sessoesRepository.findOne({
      where: { id: sessaoId },
      relations: ['mapa_assentos']
    });
  }

}
