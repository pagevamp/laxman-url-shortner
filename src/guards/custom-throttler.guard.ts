import { Injectable } from '@nestjs/common';
import {
  ThrottlerGuard as BaseThrottlerGuard,
  ThrottlerRequest,
} from '@nestjs/throttler';
@Injectable()
export class CustomThrottlerGuard extends BaseThrottlerGuard {
  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    try {
      return await super.handleRequest(requestProps);
    } catch (error) {}
  }
}
