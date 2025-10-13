import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignupRequestData } from 'src/auth/dto/signup-user-dto';
import { UserGuard } from './user.guards';
import { UpdateUserRequestData } from './dto/update-user-request-data';

@Controller('users')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  async getAllUsers() {
    return this.UserService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.UserService.findOneByField('id', id);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createUser(@Body() body: SignupRequestData) {
    return this.UserService.create(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id')
  @UseGuards(UserGuard)
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: UpdateUserRequestData,
  ) {
    return this.UserService.update(id, body);
  }
}
