import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './url.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), AuthModule],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
