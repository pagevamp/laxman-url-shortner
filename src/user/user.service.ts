import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { SignupRequestData } from 'src/auth/dto/signup-user-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOneByField<K extends keyof User>(
    field: K,
    value: User[K],
  ): Promise<User | null> {
    return this.userRepository.findOneBy({ [field]: value });
  }

  create(userDto: SignupRequestData): Promise<User> {
    const user = this.userRepository.create(userDto);
    return this.userRepository.save(user);
  }

  async update(
    userId: string,
    updateData: Partial<User>,
  ): Promise<User | null> {
    await this.userRepository.update(userId, updateData);
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
