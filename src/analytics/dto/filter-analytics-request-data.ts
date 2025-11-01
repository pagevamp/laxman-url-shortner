import { IsNotEmpty, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Transform(({ value }: { value: unknown }): Date | undefined => {
    if (typeof value === 'string') {
      const normalized = value
        .replace(/\s{2,}/g, ' ')
        .replace(' 00:00', '+00:00');
      return new Date(normalized);
    }

    if (value instanceof Date) {
      return value;
    }

    return undefined;
  })
  startDate?: Date;

  @IsOptional()
  @Transform(({ value }: { value: unknown }): Date | undefined => {
    if (typeof value === 'string') {
      const normalized = value
        .replace(/\s{2,}/g, ' ')
        .replace(' 00:00', '+00:00');
      return new Date(normalized);
    }

    if (value instanceof Date) {
      return value;
    }

    return undefined;
  })
  @IsNotEmpty()
  endDate?: Date;
}
