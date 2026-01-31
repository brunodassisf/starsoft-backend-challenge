import { Controller, Post, Body, Get, Param, } from '@nestjs/common';
import { SessaoService } from './sessao.service';
import { CreateSessaoDto } from './dto/create-sessao.dto';

@Controller('sessao')
export class SessaoController {
  constructor(private readonly sessaoService: SessaoService) { }

  @Post()
  create(@Body() createSessaoDto: CreateSessaoDto) {
    return this.sessaoService.create(createSessaoDto);
  }

  @Get(':id')
  findAll(@Param('id') id: string) {
    return this.sessaoService.findById(id);
  }

}
