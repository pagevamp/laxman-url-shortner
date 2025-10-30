import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { UrlAnalytics } from './analytics.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UrlAnalytics])],
  providers: [AnalyticsService],
  exports: [],
  controllers: [],
})
export class AnalyticsModule {}
