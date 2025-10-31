import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { CryptoService } from './crypto.service';
import { EmailModule } from 'src/email/email.module';
import { EmailVerification } from './email-verification.entity';
import { User } from 'src/user/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification]),
    EmailModule,
    UserModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService, CryptoService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
