import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { SignUpUserDto } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  async signUp(
    signUpUserDto: SignUpUserDto,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.create(signUpUserDto);
    if (user?.password !== 'pass') {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, username: user.username };
    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
