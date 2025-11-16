import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserRequestData {
  @IsOptional()
  @IsString()
  @Length(3, 50, { message: 'Username must be between 3 and 50 characters' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100, { message: 'Full name must be between 2 and 100 characters' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Full name can only contain letters and spaces',
  })
  fullName?: string;

  @IsOptional()
  @IsDate({ message: 'VerifiedAt must be a valid date' })
  @Type(() => Date)
  verifiedAt?: Date;

  @IsOptional()
  @IsDate({ message: 'LastLoginAt must be a valid date' })
  @Type(() => Date)
  lastLoginAt?: Date;
}
