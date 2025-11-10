import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignupRequestData } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { CryptoService } from './crypto.service';
import { LoginRequestData } from './dto/login-user-dto';
import * as bcrypt from 'bcrypt';
import { LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './email-verification.entity';
import { EmailVerificationPayload } from './interface';
import { JwtPayload } from 'src/types/JwtPayload';
import { EmailMessages } from '../config/messages';
import { ResendEmailVerificationRequestData } from './dto/resend-verification-dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepo: Repository<EmailVerification>,
    private readonly cryptoService: CryptoService,
  ) {}

  async signUp(signUpUserDto: SignupRequestData): Promise<{ message: string }> {
    const hashedPassword = await this.cryptoService.hashPassword(
      signUpUserDto.password,
    );

    const createUserRequestData: SignupRequestData = {
      ...signUpUserDto,
      password: hashedPassword,
    };

    const user = await this.userService.create(createUserRequestData);

    const requestData: ResendEmailVerificationRequestData = {
      email: user.email,
    };
    await this.sendVerificationLink(requestData);

    return {
      message:
        'Sign Up succesfull. Verification mail has been sent. Please verify',
    };
  }

  async sendVerificationLink(
    resendEmailVerificationRequestData: ResendEmailVerificationRequestData,
  ) {
    const email = resendEmailVerificationRequestData.email;
    const user = await this.userService.findOneByField('email', email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verifiedAt) {
      throw new BadRequestException('User is already verified');
    }

    await this.emailVerificationRepo.delete({
      userId: user.id,
    });

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

    const record = await this.emailVerificationRepo.findOne({
      where: { token, expiresAt: LessThan(new Date()) },
    });

    if (!record) {
      throw new NotFoundException('Token not found or has expired');
    }

    await this.emailVerificationRepo.save(record);

    const user = await this.userService.findOneByField('email', payload.email);
    if (!user) throw new Error('User not found');

    await this.userService.update(user.id, { verifiedAt: new Date() });

    await this.emailVerificationRepo.delete({ token });

    return { message: EmailMessages.emailVerifySuccess };
  }

  async login(
    loginRequestData: LoginRequestData,
  ): Promise<{ accessToken: string }> {
    const user = await this.userService.findOneByField(
      'email',
      loginRequestData.email,
    );
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
