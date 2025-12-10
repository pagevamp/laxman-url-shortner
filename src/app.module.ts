import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { UrlModule } from './url/url.module';
import dataSource from './data-source';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { GuardService } from './guard/guard.service';
import { GuardModule } from './guard/guard.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { RedirectModule } from './redirect/redirect.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    TypeOrmModule.forRoot(dataSource.options),
    UserModule,
    AuthModule,
    EmailModule,
    UrlModule,
    RedirectModule,
    CronModule,
    AnalyticsModule,
    GuardModule,
  ],
  controllers: [AppController],
  providers: [GuardService],
})
export class AppModule {}
