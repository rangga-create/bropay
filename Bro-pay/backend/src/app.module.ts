import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivityModule } from './activity/activity.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BudgetsModule } from './budgets/budgets.module';
import { GoalsModule } from './goals/goals.module';
import { SplitBillsModule } from './split-bills/split-bills.module';
import { MoneyRequestsModule } from './money-requests/money-requests.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    FirebaseModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    NotificationsModule,
    ActivityModule,
    AnalyticsModule,
    BudgetsModule,
    GoalsModule,
    SplitBillsModule,
    MoneyRequestsModule,
    SettingsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
