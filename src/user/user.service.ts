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
import { handleError } from 'src/utils/error-handler';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      handleError(error);
    }
  }

  async findOneByField<K extends keyof User>(
    field: K,
    value: User[K],
  ): Promise<User | null> {
    try {
      if (value === undefined || value === null) {
        throw new BadRequestException(`Invalid value for field: ${field}`);
      }

      const user = await this.userRepository.findOneBy({ [field]: value });

      return user || null;
    } catch (error) {
      handleError(error);
    }
  }

  async create(userDto: SignupRequestData): Promise<User> {
    try {
      if (!userDto.email || !userDto.username || !userDto.password) {
        throw new BadRequestException('Missing required fields');
      }

      const user = this.userRepository.create(userDto);
      return await this.userRepository.save(user);
    } catch (error) {
      handleError(error);
    }
  }

  async update(userId: string, updateData: Partial<User>): Promise<User> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const existingUser = await this.userRepository.findOneBy({ id: userId });
      if (!existingUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      await this.userRepository.update(userId, updateData);

      return await this.userRepository.findOneByOrFail({ id: userId });
    } catch (error) {
      handleError(error);
    }
  }
}
