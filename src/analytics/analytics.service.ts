import { Injectable } from '@nestjs/common';
import geoip from 'geoip-lite';
import { UrlAnalytics } from './analytics.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import useragent from 'useragent';
import { ParsedUserAgent } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { UrlRedirectedEvent } from 'src/event/Url-redirected.events';
import { FilterAnalyticsRequestData } from './dto/filter-analytics-request-data';
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UrlAnalytics)
    private readonly analyticsRepo: Repository<UrlAnalytics>,
  ) {}

  @OnEvent('url.redirected')
  async recordClick(event: UrlRedirectedEvent): Promise<void> {
    const urlId = event.urlId;
    const req = event.req;
    const ip = (req.headers['x-forwarded-for'] as string)
      ?.split(',')[0]
      ?.trim();

    const userAgent = req.headers['user-agent'] || '';
    const parsed = (
      useragent as unknown as {
        parse: (ua?: string, jsAgent?: string) => ParsedUserAgent;
      }
    ).parse(userAgent);

    const deviceMatch = parsed.source.match(/\(([^;]+);/);
    const device = deviceMatch ? deviceMatch[1] : 'Unknown Device';

    const browserMatch = parsed.source.match(
      /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/,
    );
    const browser = browserMatch ? browserMatch[0] : 'Unknown Browser';

    const osMatch = parsed.source.match(/\((?:[^;]+);\s*([^)]+)\)/);

    const os = osMatch ? osMatch[1] : 'Unknown OS';

    const geo = geoip.lookup(ip);
    const country = geo?.country || 'Unknown';

    const analytics = this.analyticsRepo.create({
      urlId,
      os,
      ip,
      browser: browser,
      userAgent,
      device: device,
      country,
    });

    await this.analyticsRepo.save(analytics);
  }

  async getAnalytics(requestData: FilterAnalyticsRequestData, userId: string) {
    const qb = this.analyticsRepo
      .createQueryBuilder('a')
      .innerJoin('a.url', 'url');

    qb.andWhere('url.userId=:userId', { userId });

    if (requestData.startDate && requestData.endDate) {
      qb.andWhere('a.redirectedAt BETWEEN :start AND :end', {
        start: requestData.startDate,
        end: requestData.endDate,
      });
    } else if (requestData.startDate) {
      qb.andWhere('a.redirectedAt >= :start', { start: requestData.startDate });
    } else if (requestData.endDate) {
      qb.andWhere('a.redirectedAt <= :end', { end: requestData.endDate });
    }

    if (requestData.browser) {
      qb.andWhere('a.browser = :browser', { browser: requestData.browser });
    }
    if (requestData.country) {
      qb.andWhere('a.country = :country', { country: requestData.country });
    }

    if (requestData.device) {
      qb.andWhere('a.device = :device', { device: requestData.device });
    }

    if (requestData.os) {
      qb.andWhere('a.os = :os', { os: requestData.os });
    }

    if (requestData.groupByUrl) {
      qb.select('a.url', 'url')
        .addSelect('COUNT(*)', 'hits')
        .groupBy('a.url')
        .orderBy('hits', 'DESC');
      return qb.getRawMany();
    }

    return qb.getMany();
  }
}
