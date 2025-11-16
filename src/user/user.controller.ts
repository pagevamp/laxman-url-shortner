import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignupRequestData } from 'src/auth/dto/signup-user-dto';
import { UpdateUserRequestData } from './dto/update-user-request-data';
import { GuardService } from 'src/guard/guard.service';
import type { RequestWithUser } from 'src/types/RequestWithUser';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllUsers() {
    return this.userService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.userService.findOneByField('id', id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() body: SignupRequestData) {
    return this.userService.create(body);
  }

  @UseGuards(GuardService)
  @HttpCode(HttpStatus.OK)
  @Patch()
  async updateUser(
    @Req() request: RequestWithUser,
    @Body()
    body: UpdateUserRequestData,
  ) {
    const userId = request.decodedData.sub;
    return this.userService.update(userId, body);
  }
}
