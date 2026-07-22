import { Module } from '@nestjs/common';
import { MoneyRequestsController } from './money-requests.controller';
import { MoneyRequestsService } from './money-requests.service';

@Module({
  controllers: [MoneyRequestsController],
  providers: [MoneyRequestsService],
})
export class MoneyRequestsModule {}
