import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
@UseGuards(FirebaseAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@CurrentUser() user: any) {
    return this.settingsService.getSettings(user.uid);
  }

  @Put()
  updateSettings(@CurrentUser() user: any, @Body() body: any) {
    return this.settingsService.updateSettings(user.uid, body);
  }
}
