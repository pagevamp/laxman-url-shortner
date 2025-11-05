import { IsNotEmpty } from 'class-validator';

export class SendMailRequestdata {
  @IsNotEmpty({ message: 'Options cannot be empty' })
  to: string;

  @IsNotEmpty({ message: 'Subject cannot be empty' })
  subject: string;

  @IsNotEmpty({ message: 'Text cannot be empty' })
  text: string;
}
