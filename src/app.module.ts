import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import typeORMConfig from './typeORMConfig';

@Module({
  imports: [
    TypeOrmModule.forRoot({ ...typeORMConfig }),
    UserModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
