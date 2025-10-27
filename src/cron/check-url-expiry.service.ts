import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from 'src/url/url.entity';
import { LessThan, Repository } from 'typeorm';
import { checkUrl } from './utils';
import { EmailService } from '../email/email.service';
import { User } from 'src/user/user.entity';

@Injectable()
export class CheckUrlExpiry {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkUrls() {
    try {
      const expiredUrls = await this.urlRepository.find({
        where: { expiresAt: LessThan(new Date()), expiryAlert: false },
      });
      if (expiredUrls.length !== 0) {
        for (const url of expiredUrls) {
          if (!checkUrl(url.expiresAt!)) {
            const user = await this.userRepository.findOneByOrFail({
              id: url.userId,
            });
            await this.emailService.sendMail({
              to: user.email,
              subject: `Your ${url.title} URL has expired`,
              text: `Hi ${user.fullName} your ${url.title} url has expired!`,
            });
            url.expiryAlert = true;
            await this.urlRepository.save(url);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
}
