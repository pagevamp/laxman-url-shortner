import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from './analytics.service';
import { UrlAnalytics } from './analytics.entity';
import { AnalyticsController } from './analytics.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UrlAnalytics]), AuthModule],
  providers: [AnalyticsService],
  exports: [],
  controllers: [AnalyticsController],
})
export class AnalyticsModule {}
