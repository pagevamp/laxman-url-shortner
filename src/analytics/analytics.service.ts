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
    const ipAddress = (req.headers['x-forwarded-for'] as string)
      ?.split(',')[0]
      ?.trim();

    const userAgent = req.headers['user-agent'] || '';
    const parsed = (
      useragent as unknown as {
        parse: (ua?: string, jsAgent?: string) => ParsedUserAgent;
      }
    ).parse(userAgent);

    // Match the first section inside parentheses of the User-Agent string (up to the first semicolon).
    // This typically represents the device or platform, e.g. "Windows NT 10.0" or "iPhone".
    const deviceMatch = parsed.source.match(/\(([^;]+);/);
    const device = deviceMatch ? deviceMatch[1] : 'Unknown Device';

    // Look for known browser names followed by a version number,
    // e.g. "Chrome/120.0", "Firefox/118.0".
    const browserMatch = parsed.source.match(
      /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/,
    );
    const browser = browserMatch ? browserMatch[0] : 'Unknown Browser';

    // Match the substring inside parentheses that follows the first semicolon.
    // For example, from "(Windows NT 10.0; Win64; x64)" → captures "Win64; x64".
    const osMatch = parsed.source.match(/\((?:[^;]+);\s*([^)]+)\)/);

    const os = osMatch ? osMatch[1] : 'Unknown OS';

    const geo = geoip.lookup(ipAddress);
    const country = geo?.country || 'Unknown';

    const analytics = this.analyticsRepo.create({
      urlId,
      os,
      ipAddress,
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

    const start = requestData.startDate || new Date(0);
    const end = requestData.endDate || new Date();

    qb.andWhere('a.redirectedAt BETWEEN :start AND :end', {
      start,
      end,
    });

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
