import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { GoalsService } from './goals.service';

@Controller('goals')
@UseGuards(FirebaseAuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    const goals = await this.goalsService.findAll(user.uid);
    return { goals };
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    const goal = await this.goalsService.create(user.uid, body);
    return { success: true, goal };
  }

  @Put(':id')
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: any) {
    const goal = await this.goalsService.update(user.uid, id, body);
    return { success: true, goal };
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.goalsService.delete(user.uid, id);
  }
}
