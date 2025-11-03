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
import { AuthGuard } from 'src/auth/auth.guard';
import type { RequestWithUser } from 'src/types/RequestWithUser';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @UseGuards(AuthGuard)
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
