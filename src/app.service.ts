import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getIndex(): string {
    return 'Cine Starsoft Backend Challenge!';
  }
}
