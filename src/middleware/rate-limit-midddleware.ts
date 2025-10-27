import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
  count: number;
  timer: NodeJS.Timeout;
}

const ipMap = new Map<string, RateLimitInfo>();

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  use = (req: Request, res: Response, next: NextFunction) => {
    const ip: string = req.ip || 'unknown';
    const limit = 5;
    const ttl = 1000;

    if (!ipMap.has(ip)) {
      const timer = setTimeout(() => ipMap.delete(ip), ttl);
      ipMap.set(ip, { count: 1, timer });
      return next();
    }

    const data = ipMap.get(ip)!;
    if (data.count >= limit) {
      res.setHeader('Retry-After', ttl / 1000);
      return res.status(429).json({
        message: 'Too many requests from this IP, please try again later.',
      });
    }

    data.count += 1;
    next();
  };
}
