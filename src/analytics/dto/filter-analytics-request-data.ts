import {
  IsDateString,
  isDateString,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
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
  @IsDateString()
  @Transform(({ value }) => new Date(value).toUTCString(), {
    toPlainOnly: true,
  })
  startDate?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value).toUTCString(), {
    toPlainOnly: true,
  })
  endDate?: Date;
}
