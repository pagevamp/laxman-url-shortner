import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpUserDto } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  private async getHashedPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async signUp(
    signUpUserDto: SignUpUserDto,
  ): Promise<{ access_token: string }> {
    const userByUsername = await this.userService.findOneByUsername(
      signUpUserDto.username,
    );
    if (userByUsername) {
      throw new BadRequestException('Username already taken');
    }
    const userByEmail = await this.userService.findOneByEmail(
      signUpUserDto.email,
    );
    if (userByEmail) {
      throw new BadRequestException('Email already taken');
    }
    const hashedPassword = await this.getHashedPassword(signUpUserDto.password);
    const { email, fullName, username } = signUpUserDto;
    const user = await this.userService.create({
      password: hashedPassword,
      email,
      fullName,
      username,
    });
    const payload = { sub: user.id, username: user.username };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
