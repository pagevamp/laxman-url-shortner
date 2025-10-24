import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupRequestData } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';
import { CryptoService } from './crypto.service';
import { LoginRequestData } from './dto/login-user-dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../types/JwtPayload';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from '../email/email.service';
import { EmailVerificationPayload } from './interface';
import { EmailVerification } from 'src/auth/email-verification.entity';
import { EmailMessages } from './messages';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService,
    private readonly emailService: EmailService,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
  ) {}

  async signUp(
    signUpUserDto: SignupRequestData,
  ): Promise<{ accessToken: string }> {
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

    try {
      await this.sendVerificationLink(email);
      console.log('Verification email sent to:', email);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    const payload = { sub: user.id, username: user.username };

    return { accessToken: await this.jwtService.signAsync(payload) };
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

    try {
      await this.emailService.sendMail({
        to: email,
        subject: 'Email confirmation',
        text,
      });
      return {
        message: EmailMessages.emailSendSuccess,
      };
    } catch (error) {
      console.error('Failed to send verification email', error);
      throw new Error(EmailMessages.emailSendFailed);
    }
  }

  async login(
    loginRequestData: LoginRequestData,
  ): Promise<{ accessToken: string }> {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginRequestData.email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
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
    } catch (error) {
      throw new BadRequestException({
        message: 'Something went wrong during login',
        error: (error as Error)?.message,
      });
    }
  }

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

  async verify(token: string) {
    try {
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
    } catch (error) {
      console.error('Verification error:', error);
      throw new BadRequestException(EmailMessages.emailVerifyFailed);
    }
  }
}
