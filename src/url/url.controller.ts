import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Redirect,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlRequestData } from './dto/create-url-request-data';
import { AuthGuard } from 'src/auth/auth.guard';
import type { RequestWithUser } from 'src/types/RequestWithUser';
import { UpdateUrlRequestData } from './dto/update-url-request-data';

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

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getUrls(@Req() request: RequestWithUser) {
    const userData = request.decodedData;
    if (!userData) {
      throw new Error('User data not found');
    }
    const userId = userData.sub;
    return await this.urlService.getAll(userId);
  }

  // @UseGuards(AuthGuard)
  @Get(':shortCode')
  @Redirect()
  async redirect(@Param('shortCode') shortCode: string) {
    const { longCode } = await this.urlService.getLongUrl(shortCode);
    return { url: longCode, statusCode: 302 };
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async updateUrl(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: Partial<UpdateUrlRequestData>,
  ) {
    const userData = request.decodedData;
    if (!userData) {
      throw new Error('User data not found');
    }
    const userId = userData.sub;
    return await this.urlService.update(userId, id, body);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteUrl(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userData = request.decodedData;
    if (!userData) {
      throw new Error('User data not found');
    }
    const userId = userData.sub;
    await this.urlService.delete(userId, id);
    return { message: 'URL deleted successfully' };
  }
}
