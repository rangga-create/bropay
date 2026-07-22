import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WalletsService } from './wallets.service';

@Controller('wallets')
@UseGuards(FirebaseAuthGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    const wallets = await this.walletsService.findAll(user.uid);
    return { wallets };
  }

  @Post()
  async create(@CurrentUser() user: any, @Body() body: any) {
    const wallet = await this.walletsService.create(user.uid, body);
    return { success: true, wallet };
  }
}
