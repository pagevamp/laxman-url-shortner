import {
  Controller,
  Get,
  HttpCode,
  Param,
  Redirect,
  Req,
} from '@nestjs/common';
import { RedirectUrlRequestData } from 'src/url/dto/redirect-request-data';
import type { RequestWithUser } from '../types/RequestWithUser';
import { RedirectService } from './redirect.service';

@Controller()
export class RedirectController {
  constructor(private readonly urlService: RedirectService) {}

  @Get(':shortCode')
  @HttpCode(302)
  @Redirect()
  async redirect(
    @Param() redirectUrlRequestData: RedirectUrlRequestData,
    @Req() req: RequestWithUser,
  ) {
    const { longCode } = await this.urlService.getLongUrl(
      redirectUrlRequestData,
      req,
    );
    return { url: longCode };
  }
}
