import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignupRequestData } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from './crypto.service';
import { LoginRequestData } from './dto/login-user-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
  ) {}

  async signUp(
    signupRequestData: SignupRequestData,
  ): Promise<{ access_token: string }> {
    try {
      const userByUsername = await this.userService.findOneByField(
        'username',
        signupRequestData.username,
      );

      if (userByUsername) {
        throw new BadRequestException('Username already taken');
      }

      const userByEmail = await this.userService.findOneByField(
        'email',
        signupRequestData.email,
      );

      if (userByEmail) {
        throw new BadRequestException('Email already taken');
      }

      const hashedPassword = await this.cryptoService.hashPassword(
        signupRequestData.password,
      );

      const { email, fullName, username } = signupRequestData;

      const user = await this.userService.create({
        password: hashedPassword,
        email,
        fullName,
        username,
      });

      const payload = { sub: user.id, username: user.username };

      return { access_token: await this.jwtService.signAsync(payload) };
    } catch (error) {
      console.error('Signup Error: ', error);
      throw error;
    }
  }

  async login(
    loginRequestData: LoginRequestData,
  ): Promise<{ access_token: string }> {
    try {
      const user = await this.userService.findOneByField(
        'email',
        loginRequestData.email,
      );
      if (!user) {
        throw new BadRequestException('User not found');
      }

      const match = await bcrypt.compare(
        loginRequestData.password,
        user.password,
      );
      const payload = { sub: user.id, username: user.username };

      if (match) {
        return { access_token: await this.jwtService.signAsync(payload) };
      } else {
        throw new BadRequestException('Invalid email or password');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
