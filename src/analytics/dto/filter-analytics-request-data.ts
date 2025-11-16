import {
  IsArray,
  IsDateString,
  IsIn,
  IsIP,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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
  @IsIn(['os', 'country', 'url', 'device', 'ipAddress', 'browser'], {
    each: true,
  })
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') return value.split(',').map((v) => v.trim());
    return value;
  })
  groupBy: string[];

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @IsPositive()
  page: number;

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
