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
import { JwtPayload } from './types/JwtPayload';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      select: [
        'id',
        'username',
        'fullName',
        'email',
        'verifiedAt',
        'createdAt',
        'lastLoginAt',
      ],
    });
  }

  async findByUserNameAndEmail(
    username: string,
    email: string,
  ): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username, email },
      select: [
        'id',
        'username',
        'fullName',
        'email',
        'verifiedAt',
        'createdAt',
        'lastLoginAt',
      ],
    });
  }

  async findOneByField<K extends keyof User>(
    field: K,
    value: User[K],
  ): Promise<User> {
    if (!value) {
      throw new BadRequestException(`Invalid value for field: ${field}`);
    }

    const user = await this.userRepository.findOne({
      where: { [field]: value },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
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

  async update(
    userId: string,
    updateData: Partial<User>,
  ): Promise<{ message: string }> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    const existingUser = await this.userRepository.findOneBy({ id: userId });
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.userRepository.update(userId, updateData);
    return { message: 'User has been updated successfully' };
  }

  validateToken(token: string): JwtPayload {
    return this.jwtService.verify<JwtPayload>(token, {
      secret: process.env.JWT_SECRET,
    });
  }
}
