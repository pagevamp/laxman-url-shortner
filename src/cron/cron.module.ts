import { Module } from '@nestjs/common';
import { EmailModule } from 'src/email/email.module';
import { CheckUrlExpiry } from './check-url-expiry.service';
import { UserModule } from 'src/user/user.module';
import { UrlModule } from 'src/url/url.module';

@Module({
  imports: [EmailModule, UserModule, UrlModule],
  controllers: [],
  providers: [CheckUrlExpiry],
  exports: [],
})
export class CronModule {}
