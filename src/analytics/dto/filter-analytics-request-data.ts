import {
  IsBoolean,
  IsDateString,
  IsIP,
  IsISO31661Alpha2,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterAnalyticsRequestData {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  browser?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  device?: string | null;

  @IsOptional()
  @IsBoolean()
  groupByUrl?: boolean | null;

  @IsOptional()
  groupByDevice?: boolean | null;

  @IsOptional()
  groupByIpAddress?: boolean | null;

  @IsOptional()
  groupByOs?: boolean | null;

  @IsOptional()
  groupByCountry?: boolean | null;

  @IsOptional()
  groupByBrowser?: boolean | null;

  @IsOptional()
  @IsUUID()
  urlId?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  os?: string | null;

  @IsOptional()
  @IsISO31661Alpha2()
  country?: string | null;

  @IsIP()
  @IsOptional()
  ipAddress?: string | null;

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
