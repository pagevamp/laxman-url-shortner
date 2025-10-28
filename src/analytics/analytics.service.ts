import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import geoip from 'geoip-lite';
import { UrlAnalytics } from './analytics.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetUrlAnalyticsRequestData } from './dto/get-url-analytics-request-data';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UrlAnalytics)
    private readonly analyticsRepo: Repository<UrlAnalytics>,
  ) {}

  async recordClick(urlId: string, req: Request): Promise<void> {
    try {
      const ip =
        (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress?.replace('::ffff:', '') ||
        '0.0.0.0';

      const userAgent = req.headers['user-agent'] || '';

      console.log(ip);
      const geo = geoip.lookup(ip);
      console.log('the geo is', geo);
      const country = geo?.country || 'Unknown';

      const analytics = this.analyticsRepo.create({
        urlId,
        ip,
        userAgent,
        country,
      });

      await this.analyticsRepo.save(analytics);
    } catch (err) {
      console.error('Failed to record click:', err);
    }
  }

  async getRecord(id: string): Promise<GetUrlAnalyticsRequestData> {
    try {
      if (!id) {
        throw new BadRequestException('Id is required');
      }

      const record = await this.analyticsRepo.findOneByOrFail({ urlId: id });
      const clicks = await this.analyticsRepo.count({ where: { urlId: id } });
      return { ...record, clicks };
    } catch (error) {
      console.error(`Error fetching url analytics `, error);

      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException('Failed to fetch url analytics');
    }
  }

  async getRecords(id: string): Promise<GetUrlAnalyticsRequestData> {
    try {
      if (!id) {
        throw new BadRequestException('Id is required');
      }
      const record = await this.analyticsRepo.findOneByOrFail({ urlId: id });
      const clicks = await this.analyticsRepo.count({ where: { urlId: id } });
      return { ...record, clicks };
    } catch (error) {
      console.error(`Error fetching url analytics `, error);

      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException('Failed to fetch url analytics');
    }
  }
}
