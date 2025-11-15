import { Url } from '../url.entity';
import { PartialType } from '@nestjs/swagger';
export class UpdateUrlRequestData extends PartialType(Url) {}
