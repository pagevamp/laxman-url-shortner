import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { RequestWithUser } from 'src/types/RequestWithUser';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UrlRedirectedEvent } from 'src/event/url-redirected.events';
import { Url } from 'src/url/url.entity';
import { RedirectUrlRequestData } from 'src/url/dto/redirect-request-data';
import { decrypt } from 'src/url/utils/crypto-helper';

@Injectable()
export class RedirectService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getLongUrl(
    redirectUrlRequestData: RedirectUrlRequestData,
    req: RequestWithUser,
  ): Promise<{ longCode: string }> {
    const { shortCode } = redirectUrlRequestData;

    if (!shortCode) {
      throw new BadRequestException('Short code is required');
    }

    const url = await this.urlRepository.findOne({
      where: {
        shortCode,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!url) {
      throw new NotFoundException('This URL has expired or does not exist');
    }

    const decryptedUrl = decrypt(url.encryptedUrl);

    const event = new UrlRedirectedEvent(url.id, req);
    this.eventEmitter.emit('url.redirected', event);

    return { longCode: decryptedUrl };
  }
}
