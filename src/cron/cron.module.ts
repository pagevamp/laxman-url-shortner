import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from 'src/url/url.entity';
import { User } from 'src/user/user.entity';
import { EmailModule } from 'src/email/email.module';
import { CheckUrlExpiry } from './check-url-expiry.service';

@Module({
  imports: [TypeOrmModule.forFeature([Url, User]), EmailModule],
  controllers: [],
  providers: [CheckUrlExpiry],
  exports: [],
})
export class CronModule {}
