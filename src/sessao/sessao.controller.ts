import { Controller, Post, Body, Get, Param, } from '@nestjs/common';
import { SessaoService } from './sessao.service';
import { CreateSessaoDto } from './dto/create-sessao.dto';
import { ApiBody, ApiOperation } from '@nestjs/swagger';

@Controller('sessao')
export class SessaoController {
  constructor(private readonly sessaoService: SessaoService) { }

  @Post()
  @ApiOperation({
    summary: 'Cria uma nova sessão',
    description: 'Este endpoint cria uma nova sessão com os dados fornecidos.'
  })
  @ApiBody({ type: CreateSessaoDto })
  create(@Body() createSessaoDto: CreateSessaoDto) {
    return this.sessaoService.criarSessao(createSessaoDto);
  }


  @Get('todas')
  @ApiOperation({
    summary: 'Lista todas as sessões',
    description: 'Este endpoint retorna uma lista paginada de todas as sessões cadastradas.'
  })
  listarTodasSessoes() {
    return this.sessaoService.listarTodasSessoes();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lista sessão por ID',
    description: 'Este endpoint retorna uma sessão específica com base no ID fornecido.'
  })
  sessaoPorId(@Param('id') id: string) {
    return this.sessaoService.sessaoPorId(id);
  }

}
