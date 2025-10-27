import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from '../auth/email-verification.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerification])],
  controllers: [],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
