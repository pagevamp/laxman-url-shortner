import { IsDate } from 'class-validator';

export class FilterAnalyticsRequestData {
  browser?: string;
  device?: string;
  groupByUrl?: boolean;
  urlId: string;
  country: string;
  ip: string;
  @IsDate({ message: 'redirected date must be a valid date' })
  redirectedAt: Date;
}
