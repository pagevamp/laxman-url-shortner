import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common'
import { UserService } from './user.service'
import { SignUpUserDto } from 'src/auth/dto/signup-user-dto'

@Controller()
export class UserController {
  constructor(private readonly UserService: UserService) {}
  @Get('users')
  async getAllUsers() {
    return this.UserService.findAll()
  }

  @Get('user/:id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.UserService.findOneById(id)
  }

  @Post('user')
  async createUser(@Body() body: SignUpUserDto) {
    return this.UserService.create(body)
  }
}
