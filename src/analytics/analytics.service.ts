import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import geoip from 'geoip-lite';
import { UrlAnalytics } from './analytics.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import useragent from 'useragent';
import { ParsedUserAgent } from './types';
import { OnEvent } from '@nestjs/event-emitter';
import { UrlRedirectedEvent } from 'src/event/Url-redirected.events';
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
    console.log('/////////////////////////', deviceMatch);
    const device = deviceMatch ? deviceMatch[1] : 'Unknown Device';
    const geo = geoip.lookup(ip);
    const country = geo?.country || 'Unknown';

    const analytics = this.analyticsRepo.create({
      urlId,
      ip,
      browser: `${parsed.family} ${parsed.major}.${parsed.minor}.${parsed.patch} `,
      userAgent,
      device: device,
      country,
    });

    await this.analyticsRepo.save(analytics);
  }

  async getAnalytics(filters: {
    startDate?: string;
    endDate?: string;
    browser?: string;
    device?: string;
    os?: string;
    groupByUrl?: boolean;
  }) {
    const qb = this.analyticsRepo.createQueryBuilder('a');

    if (filters.startDate && filters.endDate) {
      qb.andWhere('a.clickedAt BETWEEN :start AND :end', {
        start: filters.startDate,
        end: filters.endDate,
      });
    }

    if (filters.browser) {
      qb.andWhere('a.browser = :browser', { browser: filters.browser });
    }

    if (filters.device) {
      qb.andWhere('a.device = :device', { device: filters.device });
    }

    if (filters.os) {
      qb.andWhere('a.os = :os', { os: filters.os });
    }

    if (filters.groupByUrl) {
      qb.select('a.url', 'url')
        .addSelect('COUNT(*)', 'hits')
        .groupBy('a.url')
        .orderBy('hits', 'DESC');
      return qb.getRawMany();
    }

    return qb.getMany();
  }
}
