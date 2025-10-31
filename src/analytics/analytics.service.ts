import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import geoip from 'geoip-lite';
import { UrlAnalytics } from './analytics.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import useragent from 'useragent';
import { ParsedUserAgent } from './types';
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(UrlAnalytics)
    private readonly analyticsRepo: Repository<UrlAnalytics>,
  ) {}

  async recordClick(urlId: string, req: Request): Promise<void> {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress?.replace('::ffff:', '') ||
      '0.0.0.0';

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

    const geo = geoip.lookup(ip);
    const country = geo?.country || 'Unknown';
    const analytics = this.analyticsRepo.create({
      urlId,
      ip,
      browser: browser,
      userAgent,
      device: device,
      country,
    });

    await this.analyticsRepo.save(analytics);
  }
}
