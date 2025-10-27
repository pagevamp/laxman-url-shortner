import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlRequestData } from './dto/create-url-request-data';
import { AuthGuard } from 'src/auth/auth.guard';
import type { RequestWithUser } from 'src/types/RequestWithUser';

@Controller('url')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUrl(
    @Body() body: CreateUrlRequestData,
    @Req() request: RequestWithUser,
  ) {
    const userData = request.decodedData;
    if (!userData) {
      throw new Error('User data not found');
    }
    const userId = userData.sub;
    return await this.urlService.create(userId, body);
  }
  // @UseGuards(AuthGuard)
  @Get(':shortCode')
  @Redirect()
  async redirect(@Param('shortCode') shortCode: string) {
    const { longCode } = await this.urlService.getLongUrl(shortCode);
    return { url: longCode, statusCode: 302 };
  }
}
