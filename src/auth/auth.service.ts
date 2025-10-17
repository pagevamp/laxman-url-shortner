import { BadRequestException, Injectable } from '@nestjs/common';
import { SignupRequestData } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';
import { HashService } from './hash.service';
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
    private readonly hashService: HashService,
    private readonly emailService: EmailService,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
  ) {}

  async signUp(
    signUpUserDto: SignupRequestData,
  ): Promise<{ access_token: string }> {
    const userByUsername = await this.userRepository.findOne({
      where: { username: signUpUserDto.username },
    });

    if (userByUsername) {
      throw new BadRequestException('Username already taken');
    }

    const userByEmail = await this.userRepository.findOne({
      where: { email: signUpUserDto.email },
    });

    if (userByEmail) {
      throw new BadRequestException('Email already taken');
    }

    const hashedPassword = await this.hashService.hashPassword(
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

    return { access_token: await this.jwtService.signAsync(payload) };
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

      user.verifiedAt = new Date();

      await this.userRepository.update(user.id, user);

      await this.emailVerificationRepo.delete({ token });

      return { message: EmailMessages.emailVerifySuccess };
    } catch (error) {
      console.error('Verification error:', error);
      throw new BadRequestException(EmailMessages.emailVerifyFailed);
    }
  }
}
