import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(FirebaseAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  async summary(@CurrentUser() user: any, @Query('range') _range: string) {
    return this.analyticsService.summary(user.uid);
  }

  @Get('categories')
  async categories(@CurrentUser() user: any, @Query('range') _range: string) {
    return this.analyticsService.categories(user.uid);
  }

  @Get('monthly')
  async monthly(@CurrentUser() user: any, @Query('range') _range: string) {
    return this.analyticsService.monthly(user.uid);
  }
}
