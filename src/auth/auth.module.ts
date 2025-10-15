import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { CryptoService } from './crypto.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    UserModule,
    EmailModule,
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
