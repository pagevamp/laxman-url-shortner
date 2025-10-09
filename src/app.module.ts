import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { typeORMConfig } from './data-source';

@Module({
  imports: [TypeOrmModule.forRoot(typeORMConfig), UserModule, AuthModule],
  controllers: [AppController],
})
export class AppModule {}
