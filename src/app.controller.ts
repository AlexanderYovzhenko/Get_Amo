import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async makeDeal() {
    try {
      return await this.appService.makeDeal();
    } catch (error) {
      return {
        message: 'An error happened!',
        error: error.message,
      };
    }
  }
}
