import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { User } from './user.entity'
import { Repository } from 'typeorm'
import { createUserDto } from './dto/create-user.dto'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find()
  }

  findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id })
  }

  findOne(username: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username })
  }

  create(userDto: createUserDto): Promise<User> {
    const user = this.userRepository.create(userDto)
    return this.userRepository.save(user)
  }
}
