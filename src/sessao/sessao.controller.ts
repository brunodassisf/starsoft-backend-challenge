import { Controller, Post, Body, } from '@nestjs/common';
import { SessaoService } from './sessao.service';
import { CreateSessaoDto } from './dto/create-sessao.dto';

@Controller('sessao')
export class SessaoController {
  constructor(private readonly sessaoService: SessaoService) { }

  @Post()
  create(@Body() createSessaoDto: CreateSessaoDto) {
    return this.sessaoService.create(createSessaoDto);
  }

}
