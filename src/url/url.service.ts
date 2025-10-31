import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Url } from './url.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { CreateUrlRequestData } from './dto/create-url-request-data';
import {
  CodeGenerator,
  decrypt,
  encrypt,
  hashString,
} from './utils/crypto-helper';
import { UserService } from '../user/user.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { RequestWithUser } from 'src/types/RequestWithUser';
import { GetUrlResponseData } from './dto/get-urls-response-data';
@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly userService: UserService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async create(
    userId: string,
    createUrlRequestData: CreateUrlRequestData,
  ): Promise<Url> {
    if (!createUrlRequestData.originalUrl) {
      throw new BadRequestException('Missing required fields');
    }
    const hashUrl = hashString(createUrlRequestData.originalUrl);

    const existingUrl = await this.urlRepository.findOne({
      where: { originalUrl: hashUrl },
    });

    if (existingUrl) {
      throw new BadRequestException('short url for this URL already exists');
    }
    const shortCode = CodeGenerator();
    const encryptedUrl = encrypt(createUrlRequestData.originalUrl);
    const url = this.urlRepository.create({
      title: createUrlRequestData.title,
      userId: userId,
      shortCode: shortCode,
      encryptedUrl: encryptedUrl,
      expiresAt: createUrlRequestData.expiresAt,
      originalUrl: hashUrl,
    });
    return await this.urlRepository.save(url);
  }

  async getLongUrl(
    shortCode: string,
    req: RequestWithUser,
  ): Promise<{ longCode: string }> {
    if (!shortCode) {
      throw new BadRequestException('Short code is required');
    }
    const url = await this.urlRepository.findOneByOrFail({
      shortCode,
      expiresAt: MoreThan(new Date()),
    });

    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      throw new NotFoundException('This URL has expired');
    }

    const decryptedUrl = decrypt(url.encryptedUrl);
    await this.analyticsService.recordClick(url.id, req);
    return { longCode: decryptedUrl };
  }

  async getAll(userId: string): Promise<GetUrlResponseData[]> {
    const urls: GetUrlResponseData[] = await this.urlRepository.find({
      where: { userId: userId },
      select: ['id', 'title', 'shortCode', 'expiresAt'],
    });
    const result = urls.map((item) => ({
      ...item,
      shortCode: `${process.env.REDIRECT_BASE_URL}${item.shortCode}`,
    }));
    return result;
  }

  async update(
    userId: string,
    urlId: string,
    updateData: Partial<Url>,
  ): Promise<Url> {
    if (!urlId) {
      throw new BadRequestException('URL id is required');
    }

    const existingUrl = await this.urlRepository.findOneBy({
      id: urlId,
      userId: userId,
    });
    if (!existingUrl) {
      throw new NotFoundException(`Url with ID ${urlId} not found`);
    }

    await this.urlRepository.update(urlId, updateData);

    return await this.urlRepository.findOneByOrFail({ id: urlId });
  }

  async delete(userId: string, urlId: string): Promise<void> {
    if (!urlId) {
      throw new BadRequestException('URL id is required');
    }
    const existingUrl = await this.urlRepository.findOneBy({
      id: urlId,
      userId: userId,
    });

    if (!existingUrl) {
      throw new NotFoundException(`Url with ID ${urlId} not found`);
    }

    await this.urlRepository.delete({ id: urlId });
  }
}
