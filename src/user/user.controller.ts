import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { UserService } from './user.service'
import { createUserDto } from './dto/create-user.dto'

@Controller()
export class UserController {
  constructor(private readonly UserService: UserService) {}
  @Get('users')
  async getAllUsers() {
    return this.UserService.findAll()
  }

  @Get('user/:id')
  async getUser(@Param('id') id: string) {
    return this.UserService.findOneById(id)
  }

  @Post('user')
  async createUser(@Body() body: createUserDto) {
    return this.UserService.create(body)
  }
}
