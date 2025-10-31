import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from 'src/url/url.entity';
import { User } from 'src/user/user.entity';
import { EmailModule } from 'src/email/email.module';
import { CheckUrlExpiry } from './check-url-expiry.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url, User]), EmailModule, UserModule],
  controllers: [],
  providers: [CheckUrlExpiry],
  exports: [],
})
export class CronModule {}
