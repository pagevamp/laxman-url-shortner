import {
  IsNotEmpty,
  IsEmail,
  Length,
  IsOptional,
  IsString,
} from 'class-validator';

export class SendMailRequestData {
  @IsNotEmpty({ message: 'Recipient email cannot be empty' })
  @IsEmail({}, { message: 'Recipient must be a valid email address' })
  to: string;

  @IsNotEmpty({ message: 'Subject cannot be empty' })
  @Length(1, 255, { message: 'Subject must be between 1 and 255 characters' })
  subject: string;

  @IsNotEmpty({ message: 'Text cannot be empty' })
  @Length(1, 5000, { message: 'Text must be between 1 and 5000 characters' })
  text: string;

  @IsOptional()
  @IsString({ message: 'HTML content must be a string' })
  @Length(1, 10000, {
    message: 'HTML content must be between 1 and 10000 characters',
  })
  html?: string;
}
