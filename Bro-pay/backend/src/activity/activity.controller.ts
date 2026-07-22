import { Controller, Get, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ActivityService } from './activity.service';

@Controller('activity')
@UseGuards(FirebaseAuthGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    const activities = await this.activityService.findAll(user.uid);
    return { activities };
  }
}
