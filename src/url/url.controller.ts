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
import { RedirectUrlRequestData } from './dto/redirect-request-data';
import { UpdateUrlRequestData } from './dto/update-url-request-data';

@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUrl(
    @Body() body: CreateUrlRequestData,
    @Req() request: RequestWithUser,
  ) {
    const userId = request.decodedData.sub;
    return await this.urlService.create(userId, body);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async getUrls(@Req() request: RequestWithUser) {
    const userId = request.decodedData.sub;
    return await this.urlService.getAll(userId);
  }

  // @UseGuards(AuthGuard)
  @Get(':shortCode')
  @Redirect()
  async redirect(
    @Param() redirectUrlRequestData: RedirectUrlRequestData,
    @Req() req: RequestWithUser,
  ) {
    const { longCode } = await this.urlService.getLongUrl(
      redirectUrlRequestData,
      req,
    );
    return { url: longCode, statusCode: 302 };
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  async updateUrl(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    updateUrlRequestData: UpdateUrlRequestData,
  ) {
    const userId = request.decodedData.sub;
    return await this.urlService.update(userId, id, updateUrlRequestData);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':id')
  async deleteUrl(
    @Req() request: RequestWithUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const userId = request.decodedData.sub;
    await this.urlService.delete(userId, id);
    return { message: 'URL deleted successfully' };
  }
}
