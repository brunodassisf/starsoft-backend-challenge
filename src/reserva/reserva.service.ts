import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
export class ReservaService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async solicitarReserva(assentoId: string, userId: string) {
        const cacheKey = `seat_lock:${assentoId}`;

        const existingReservation = await this.cacheManager.get(cacheKey);

        if (existingReservation) {
            return {
                success: false,
                message: 'Este assento já está reservado.',
            };
        }

        await this.cacheManager.set(cacheKey, userId, 100000);

        return {
            success: true,
            message: `Assento ${assentoId} reservado para o usuário ${userId}.`,
            expiresIn: '30s',
        };
    }

}