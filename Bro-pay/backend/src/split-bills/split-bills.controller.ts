import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SplitBillsService } from './split-bills.service';

@Controller('split-bills')
@UseGuards(FirebaseAuthGuard)
export class SplitBillsController {
  constructor(private readonly splitBillsService: SplitBillsService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    const splitBills = await this.splitBillsService.findAll(user.uid);
    return { splitBills };
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    const splitBill = await this.splitBillsService.create(user.uid, body);
    return { success: true, splitBill };
  }

  @Put(':id/settle')
  async settle(@CurrentUser() user: any, @Param('id') id: string) {
    return this.splitBillsService.settle(user.uid, id);
  }
}
