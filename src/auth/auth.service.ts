import { BadRequestException, Injectable } from '@nestjs/common'
import { UserService } from '../user/user.service'
import { SignUpUserDto } from './dto/signup-user-dto'
import { JwtService } from '@nestjs/jwt'
import { scrypt as _scrypt, randomBytes } from 'crypto'
import { promisify } from 'util'

const scrypt = promisify(_scrypt)
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private async getHashedPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex')
    const hash = (await scrypt(password, salt, 32)) as Buffer
    const hashedPassword = salt + '.' + hash.toString('hex')
    return hashedPassword
  }

  async signUp(
    signUpUserDto: SignUpUserDto,
  ): Promise<{ access_token: string }> {
    const userByUsername = await this.userService.findOne(
      signUpUserDto.username,
    )
    const userByEmail = await this.userService.findOne(signUpUserDto.email)
    if (userByUsername) {
      throw new BadRequestException('Username already taken')
    }
    if (userByEmail) {
      throw new BadRequestException('Email already taken')
    }
    const hashedPassword = await this.getHashedPassword(signUpUserDto.password)
    const { email, fullName, username } = signUpUserDto
    const user = await this.userService.create({
      password: hashedPassword,
      email,
      fullName,
      username,
    })
    const payload = { sub: user.id, username: user.username }
    return { access_token: await this.jwtService.signAsync(payload) }
  }
}
