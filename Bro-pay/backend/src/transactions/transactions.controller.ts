import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { TransactionsService } from './transactions.service';
import { WalletsService } from '../wallets/wallets.service';

@Controller('transactions')
@UseGuards(FirebaseAuthGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly walletsService: WalletsService,
  ) {}

  @Get()
  async list(@CurrentUser() user: any, @Query() query: any) {
    return this.transactionsService.findAll(user.uid, query);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: any, @Param('id') id: string) {
    const transaction = await this.transactionsService.findOne(user.uid, id);
    return { transaction };
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    const transaction = await this.transactionsService.create(user.uid, body);
    const wallets = await this.walletsService.findAll(user.uid);
    const balance = wallets.reduce((sum: number, w: any) => sum + Number(w.balance), 0);
    return { success: true, transaction, balance };
  }
}
