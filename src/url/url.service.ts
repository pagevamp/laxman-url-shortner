import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from './url.entity';
import { Repository } from 'typeorm';
import { CreateUrlRequestData } from './dto/create-url-request-data';
import {
  CodeGenerator,
  decrypt,
  encrypt,
  hashString,
} from './utils/crypto-helper';
import { UserService } from '../user/user.service';
@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    private readonly userService: UserService,
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
        userId: userId,
        shortCode: shortCode,
        longCode: encryptedUrl,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        originalUrl: hashUrl,
      });
      return await this.urlRepository.save(url);
    } catch (error) {
      throw new BadRequestException({
        message: (error as Error)?.message,
      });
    }
  }

  async getLongUrl(shortCode: string): Promise<{ longCode: string }> {
    if (!shortCode) {
      throw new BadRequestException('Short code is required');
    }
    console.log('the short code is:', shortCode);
    const url = await this.urlRepository.findOneByOrFail({
      shortCode,
    });

    if (url.expiresAt && new Date(url.expiresAt) < new Date()) {
      throw new NotFoundException('This URL has expired');
    }

    const decryptedUrl = decrypt(url.longCode);

    return { longCode: decryptedUrl };
  }
}
