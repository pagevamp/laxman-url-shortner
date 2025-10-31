import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { HashService } from './hash.service';
import { EmailModule } from 'src/email/email.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { EmailVerification } from 'src/auth/email-verification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification]),
    EmailModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, HashService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
