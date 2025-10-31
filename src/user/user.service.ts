import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { SignupRequestData } from 'src/auth/dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOneByField<K extends keyof User>(
    field: K,
    value: User[K],
  ): Promise<User | null> {
    if (value === undefined || value === null) {
      throw new BadRequestException(`Invalid value for field: ${field}`);
    }

    const user = await this.userRepository.findOneBy({ [field]: value });

    return user || null;
  }

  async create(signUpUserDto: SignupRequestData): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: signUpUserDto.username },
        { email: signUpUserDto.email },
      ],
    });

    if (existingUser) {
      if (existingUser.username === signUpUserDto.username) {
        throw new BadRequestException('Username already taken');
      }

      if (existingUser.email === signUpUserDto.email) {
        throw new BadRequestException('Email already taken');
      }
    }
    const user = this.userRepository.create(signUpUserDto);
    return await this.userRepository.save(user);
  }

  async update(userId: string, updateData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ id: userId });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.userRepository.update(userId, updateData);

    return await this.userRepository.findOneByOrFail({ id: userId });
  }
}
