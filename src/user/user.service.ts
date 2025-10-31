import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new BadRequestException('Failed to fetch users');
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
      console.error(`Error fetching user by ${String(field)}:`, error);
      throw new BadRequestException('Failed to fetch user');
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
      console.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user');
    }
  }

  async update(userId: string, updateData: Partial<User>): Promise<User> {
    try {
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const existingUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      await this.userRepository.update(userId, updateData);
      return await this.userRepository.findOneOrFail({ where: { id: userId } });
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw new BadRequestException('Failed to update user');
    }
  }
}
