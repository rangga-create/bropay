import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { FirebaseAuthGuard } from './common/guards/firebase-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('dashboard')
  @UseGuards(FirebaseAuthGuard)
  getDashboard(@Req() req: any) {
    return this.appService.getDashboard(req.user.uid);
  }
}
