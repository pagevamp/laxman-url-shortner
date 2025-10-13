import { IsNotEmpty } from 'class-validator';

export class UpdateUserRequestData {
  @IsNotEmpty()
  fullName: string;
}
