import {
  IsArray,
  IsDateString,
  IsIn,
  IsIP,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
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
  @IsArray()
  @IsIn(['os', 'country', 'url', 'device', 'ipAddress'], { each: true })
  groupBy: string[];

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  page?: number;

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
