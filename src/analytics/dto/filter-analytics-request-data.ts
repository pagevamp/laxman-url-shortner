import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterAnalyticsRequestData {
  @IsOptional()
  browser?: string;

  @IsOptional()
  device?: string;

  @IsOptional()
  groupByUrl?: boolean;

  @IsOptional()
  urlId?: string;

  @IsOptional()
  os?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  ip?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Invalid start date' })
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Invalid end date' })
  endDate?: Date;
}
