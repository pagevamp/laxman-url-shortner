import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { UrlAnalytics } from './analytics.entity';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UrlAnalytics])],
  providers: [AnalyticsService],
  exports: [],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
