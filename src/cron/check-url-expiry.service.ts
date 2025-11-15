import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';
import { UrlService } from '../url/url.service';

@Injectable()
export class CheckUrlExpiry {
  constructor(
    private readonly emailService: EmailService,
    private readonly urlService: UrlService,
    private readonly userService: UserService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkUrls() {
    const expiredUrls = await this.urlService.checkExpiredUrl();
    for (const url of expiredUrls) {
      const user = await this.userService.findOneByField('id', url.userId);
      if (!user) {
        continue; // skip if user not found
      }

      await this.emailService.sendMail({
        to: user.email,
        subject: `Your ${url.title} URL has expired`,
        text: `Hi ${user.fullName}, your ${url.title} URL has expired!`,
      });

      await this.urlService.update(user.id, url.id, {
        ...url,
        expiryAlertedAt: new Date(),
      });
    }
  }
}
