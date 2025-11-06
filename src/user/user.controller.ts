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
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignupRequestData } from 'src/auth/dto/signup-user-dto';
import { UserGuard } from './user.guards';
import { UpdateUserRequestData } from './dto/update-user-request-data';

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

  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  @UseGuards(UserGuard)
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: UpdateUserRequestData,
  ) {
    return this.userService.update(id, body);
  }
}
