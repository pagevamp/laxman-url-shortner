import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
import { GetUrlRequestData } from './dto/get-urls-request-data';
import { AnalyticsService } from '../analytics/analytics.service';
import { Request } from 'express';
import { RequestWithUser } from 'src/types/RequestWithUser';
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
    try {
      const user = await this.userService.findOneByField('id', userId);
      if (user?.verifiedAt === null) {
        throw new BadRequestException('Please verify with your email first');
      }
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
    } catch (error) {
      throw new BadRequestException({
        message: (error as Error)?.message,
      });
    }
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

  async getAll(userId: string): Promise<GetUrlRequestData[]> {
    const urls = (await this.urlRepository.find({
      where: { userId: userId },
      select: ['title', 'shortCode', 'expiresAt'],
    })) as GetUrlRequestData[];
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

    try {
      const existingUrl = await this.urlRepository.findOneBy({ id: urlId });
      if (!existingUrl) {
        throw new NotFoundException(`Url with ID ${urlId} not found`);
      }

      if (existingUrl.userId !== userId) {
        throw new UnauthorizedException('You are not authorized');
      }

      await this.urlRepository.update(urlId, updateData);

      return await this.urlRepository.findOneByOrFail({ id: urlId });
    } catch (error) {
      console.error(`Error updating url ${urlId}:`, error);

      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException('Failed to update url');
    }
  }

  async delete(userId: string, urlId: string): Promise<void> {
    if (!urlId) {
      throw new BadRequestException('URL id is required');
    }
    try {
      const existingUrl = await this.urlRepository.findOneBy({ id: urlId });
      if (!existingUrl) {
        throw new NotFoundException(`Url with ID ${urlId} not found`);
      }

      if (existingUrl.userId !== userId) {
        throw new UnauthorizedException('You are not authorized');
      }

      const deletedUrl = await this.urlRepository.delete({ id: urlId });
      if (deletedUrl.affected === 0) {
        throw new NotFoundException('URL not found');
      }
    } catch (error) {
      console.error(`Error updating url ${urlId}:`, error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Failed to delete url');
    }
  }
}
