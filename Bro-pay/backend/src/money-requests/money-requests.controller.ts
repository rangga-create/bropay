import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MoneyRequestsService } from './money-requests.service';

@Controller('money-requests')
@UseGuards(FirebaseAuthGuard)
export class MoneyRequestsController {
  constructor(private readonly moneyRequestsService: MoneyRequestsService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    const requests = await this.moneyRequestsService.findAll(user.uid);
    return { requests };
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    const request = await this.moneyRequestsService.create(user.uid, body);
    return { success: true, request };
  }

  @Put(':id/accept')
  async accept(@CurrentUser() user: any, @Param('id') id: string) {
    return this.moneyRequestsService.accept(user.uid, id);
  }

  @Put(':id/decline')
  async decline(@CurrentUser() user: any, @Param('id') id: string) {
    return this.moneyRequestsService.decline(user.uid, id);
  }
}
