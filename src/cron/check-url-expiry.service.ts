import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Url } from 'src/url/url.entity';
import { IsNull, LessThan, Repository } from 'typeorm';
import { EmailService } from '../email/email.service';
import { User } from 'src/user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class CheckUrlExpiry {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkUrls() {
    const expiredUrls = await this.urlRepository.find({
      where: { expiresAt: LessThan(new Date()), expiryAlertedAt: IsNull() },
    });
    for (const url of expiredUrls) {
      const user = await this.userService.findOneByField('id', url.userId);
      await this.emailService.sendMail({
        to: user.email,
        subject: `Your ${url.title} URL has expired`,
        text: `Hi ${user.fullName} your ${url.title} url has expired!`,
      });
      await this.urlRepository.save({
        ...url,
        expiryAlertedAt: new Date(Date.now()),
      });
    }
  }
}
