import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Url } from './url.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';
import { AnalyticsModule } from 'src/analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Url]),
    AuthModule,
    UserModule,
    AnalyticsModule,
  ],
  controllers: [UrlController],
  providers: [UrlService],
  exports: [UrlService],
})
export class UrlModule {}
