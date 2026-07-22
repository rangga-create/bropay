import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { BudgetsService } from './budgets.service';

@Controller('budgets')
@UseGuards(FirebaseAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    const budgets = await this.budgetsService.findAll(user.uid);
    return { budgets };
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    const budget = await this.budgetsService.create(user.uid, body);
    return { success: true, budget };
  }

  @Put(':id')
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const budget = await this.budgetsService.update(user.uid, id, body);
    return { success: true, budget };
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.budgetsService.delete(user.uid, id);
  }
}
