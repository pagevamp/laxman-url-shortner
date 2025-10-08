import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { createUserDto } from './dto/create-user.dto';

@Controller()
export class UserController {
  constructor(private readonly UserService: UserService) {}
  @Get('users')
  async getAllUsers() {
    return this.UserService.findAll();
  }

  @Post('user')
  async createUser(@Body() body: createUserDto) {
    return this.UserService.create(body);
  }
}
