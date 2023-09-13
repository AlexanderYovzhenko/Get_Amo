import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { MakeDealQueryDto } from './dto/query-params-make-deal.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async makeDeal(@Query() queryParams: MakeDealQueryDto) {
    try {
      return await this.appService.makeDeal(queryParams);
    } catch (error) {
      return {
        message: 'An error happened!',
        error: error.message,
      };
    }
  }
}
