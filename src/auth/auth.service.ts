import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupRequestData } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { CryptoService } from './crypto.service';
import { LoginRequestData } from './dto/login-user-dto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './email-verification.entity';
import { EmailVerificationPayload } from './interface';
import { EmailMessages } from './messages';
import { JwtPayload } from 'src/types/JwtPayload';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
    private readonly cryptoService: CryptoService,
  ) {}

  async signUp(signUpUserDto: SignupRequestData): Promise<User> {
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

    const userByEmail = await this.userRepository.findOne({
      where: { email: signUpUserDto.email },
    });

    if (userByEmail) {
      throw new BadRequestException('Email already taken');
    }

    const hashedPassword = await this.cryptoService.hashPassword(
      signUpUserDto.password,
    );

    const { email, fullName, username } = signUpUserDto;

    const user = this.userRepository.create({
      password: hashedPassword,
      email,
      fullName,
      username,
    });

    await this.userRepository.save(user);

    await this.sendVerificationLink(email);

    return user;
  }

  async sendVerificationLink(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verifiedAt !== null) {
      throw new BadRequestException('User is already verified');
    }

    const payload: EmailVerificationPayload = {
      email,
    };
    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      expiresIn: 3600,
    });

    const expiresAt = new Date(Date.now() + 3600 * 1000);

    const emailVerification = this.emailVerificationRepo.create({
      userId: user.id,
      token,
      expiresAt,
    });

    await this.emailVerificationRepo.save(emailVerification);

    const url = `${process.env.EMAIL_CONFIRMATION_URL}?token=${token}`;

    const text = `Welcome to the application. To confirm the email address, click here: ${url}`;

    await this.emailService.sendMail({
      to: email,
      subject: 'Email confirmation',
      text,
    });
    return {
      message: EmailMessages.emailSendSuccess,
    };
  }
  async verify(token: string) {
    const payload = this.jwtService.verify<EmailVerificationPayload>(token, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
    });

    const record = await this.emailVerificationRepo.findOneByOrFail({
      token,
    });

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token has expired');
    }

    await this.emailVerificationRepo.save(record);

    const user = await this.userRepository.findOne({
      where: {
        email: payload.email,
      },
    });
    if (!user) throw new Error('User not found');

    await this.userRepository.update(user.id, { verifiedAt: new Date() });

    await this.emailVerificationRepo.delete({ token });

    return { message: EmailMessages.emailVerifySuccess };
  }

  async login(
    loginRequestData: LoginRequestData,
  ): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({
      where: {
        email: loginRequestData.email,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verifiedAt === null) {
      throw new BadRequestException(
        'User not verified. Please verify before login',
      );
    }

    const match = await bcrypt.compare(
      loginRequestData.password,
      user.password,
    );
    const payload = { sub: user.id, username: user.username };

    if (match) {
      return { accessToken: await this.jwtService.signAsync(payload) };
    } else {
      throw new BadRequestException('Invalid email or password');
    }
  }

  async validateToken(token: string): Promise<JwtPayload> {
    const decoded = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: process.env.JWT_SECRET,
    });
    return decoded;
  }
}
