import { IsDate, IsOptional } from 'class-validator';

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
  @IsDate({ message: 'Redirected date must be a valid date' })
  redirectedAt?: Date;

  @IsOptional()
  @IsDate({ message: 'Starting date must be a valid date' })
  @IsOptional()
  startDate?: Date;

  @IsDate({ message: 'End date must be a valid date' })
  @IsOptional()
  endDate?: Date;
}
