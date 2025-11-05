import { CreateUrlRequestData } from './create-url-request-data';
import { PartialType } from '@nestjs/swagger';
export class UpdateUrlRequestData extends PartialType(CreateUrlRequestData) {}
