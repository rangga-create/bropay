import { Controller, Delete, Get, Param, Put, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(FirebaseAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@CurrentUser() user: any) {
    const notifications = await this.notificationsService.findAll(user.uid);
    return { notifications };
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: any) {
    return this.notificationsService.unreadCount(user.uid);
  }

  @Put(':id/read')
  async markRead(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.markRead(user.uid, id);
  }

  @Delete(':id')
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    return this.notificationsService.delete(user.uid, id);
  }
}
