import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { SignupRequestData } from 'src/auth/dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/JwtPayload';
import { Throttle } from '@nestjs/throttler';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });
      return decoded;
    } catch (error) {
      console.error('Token validation error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

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

  @Throttle({ default: { limit: 20, ttl: 300000 } })
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
      console.error(`Error updating user ${userId}:`, error);

      if (error instanceof NotFoundException) throw error;

      throw new BadRequestException('Failed to update user');
    }
  }
}
