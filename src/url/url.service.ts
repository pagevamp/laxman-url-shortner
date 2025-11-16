import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Url } from './url.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, MoreThan, Repository } from 'typeorm';
import { CreateUrlRequestData } from './dto/create-url-request-data';
import {
  CodeGenerator,
  decrypt,
  encrypt,
  hashString,
} from './utils/crypto-helper';
import { RequestWithUser } from 'src/types/RequestWithUser';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UrlRedirectedEvent } from 'src/event/url-redirected.events';
import { RedirectUrlRequestData } from './dto/redirect-request-data';
import { UpdateUrlRequestData } from './dto/update-url-request-data';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    userId: string,
    createUrlRequestData: CreateUrlRequestData,
  ): Promise<Url> {
    const hashUrl = hashString(createUrlRequestData.originalUrl);

    const existingUrl = await this.urlRepository.findOne({
      where: { originalUrl: hashUrl, userId },
    });

    if (existingUrl) {
      throw new BadRequestException('Short URL for this URL already exists');
    }

    const shortCode = CodeGenerator();
    const encryptedUrl = encrypt(createUrlRequestData.originalUrl);

    const url = this.urlRepository.create({
      title: createUrlRequestData.title,
      userId,
      shortCode,
      encryptedUrl,
      expiresAt: createUrlRequestData.expiresAt,
      originalUrl: hashUrl,
    });

    return await this.urlRepository.save(url);
  }

  async checkExpiredUrl(): Promise<Url[]> {
    return await this.urlRepository.find({
      where: { expiresAt: LessThan(new Date()), expiryAlertedAt: IsNull() },
    });
  }

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

  async getAll(
    userId: string,
  ): Promise<
    (Pick<Url, 'id' | 'title' | 'expiresAt'> & { shortCode: string })[]
  > {
    const urls = await this.urlRepository.find({
      where: { userId },
      select: ['id', 'title', 'shortCode', 'expiresAt'],
    });

    return urls.map((item) => ({
      ...item,
      shortCode: `${process.env.REDIRECT_BASE_URL}${item.shortCode}`,
    }));
  }

  async update(
    userId: string,
    urlId: string,
    updateUrlRequestData: UpdateUrlRequestData,
  ): Promise<{ message: string }> {
    if (!urlId) {
      throw new BadRequestException('URL id is required');
    }

    const existingUrl = await this.urlRepository.findOne({
      where: {
        id: urlId,
        userId,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!existingUrl) {
      throw new NotFoundException(
        `URL with ID ${urlId} not found or the URL is already expired`,
      );
    }

    await this.urlRepository.update(urlId, updateUrlRequestData);
    return { message: 'URL has been updated successfully' };
  }

  async delete(userId: string, urlId: string): Promise<void> {
    const existingUrl = await this.urlRepository.findOneBy({
      id: urlId,
      userId,
    });

    if (!existingUrl) {
      throw new NotFoundException(`URL with ID ${urlId} not found`);
    }

    await this.urlRepository.softDelete({ id: urlId });
  }
}
