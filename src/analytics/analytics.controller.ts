import { Body, Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { FilterAnalyticsRequestData } from './dto/filter-analytics-request-data';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Get()
  async filterUrlAnalytics(@Body() body: FilterAnalyticsRequestData) {
    return this.analyticsService.getAnalytics(body);
  }
}
