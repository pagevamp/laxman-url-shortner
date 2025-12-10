import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { GuardModule } from 'src/guard/guard.module';
import { RedirectController } from './redirect.controllers';
import { RedirectService } from './redirect.service';
import { Url } from 'src/url/url.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Url]), AuthModule, GuardModule],
  controllers: [RedirectController],
  providers: [RedirectService],
  exports: [RedirectService],
})
export class RedirectModule {}
