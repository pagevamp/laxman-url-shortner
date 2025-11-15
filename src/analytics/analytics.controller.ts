import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FilterAnalyticsRequestData } from './dto/filter-analytics-request-data';
import { AnalyticsService } from './analytics.service';
import type { RequestWithUser } from 'src/types/RequestWithUser';
import { GuardService } from 'src/guard/guard.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(GuardService)
  @HttpCode(HttpStatus.OK)
  @Get()
  async filterUrlAnalytics(
    @Query() query: FilterAnalyticsRequestData,
    @Req() request: RequestWithUser,
  ) {
    const userId = request.decodedData.sub;
    return this.analyticsService.getAnalytics(query, userId);
  }
}
