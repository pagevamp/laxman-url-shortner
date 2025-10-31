import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { GuardService } from './guard.service';

@Module({
  imports: [AuthModule],
  providers: [GuardService],
  controllers: [],
  exports: [GuardService],
})
export class GuardModule {}
