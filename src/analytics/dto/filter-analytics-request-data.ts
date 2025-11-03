import { IsDateString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterAnalyticsRequestData {
  @IsOptional()
  browser?: string | null;

  @IsOptional()
  device?: string | null;

  @IsOptional()
  groupByUrl?: boolean | null;

  @IsOptional()
  urlId?: string | null;

  @IsOptional()
  os?: string | null;

  @IsOptional()
  country?: string | null;

  @IsOptional()
  ip?: string | null;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toUTCString(), {
    toPlainOnly: true,
  })
  startDate?: Date | null;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toUTCString(), {
    toPlainOnly: true,
  })
  endDate?: Date | null;
}
