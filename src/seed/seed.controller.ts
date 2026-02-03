import { Controller, Get, Param } from '@nestjs/common';
import { SeedService } from './seed.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('seed')
export class SeedController {
    constructor(private readonly seedService: SeedService) { }

    @Get('users')
    @ApiOperation({
        summary: 'Lista todos os usuários',
        description: 'Este endpoint retorna uma lista paginada de todos os usuários cadastrados.'
    })
    async listAllUsers() {
        return this.seedService.listAllUsers();
    }

    @Get('historico-compras/:usuario_id')
    @ApiOperation({
        summary: 'Lista o histórico de compras de um usuário',
        description: 'Este endpoint retorna o histórico de compras de um usuário específico.'
    })
    async listHistoricoCompras(@Param('usuario_id') usuario_id: string) {
        return this.seedService.historicoComprasUsuario(usuario_id);
    }
}
