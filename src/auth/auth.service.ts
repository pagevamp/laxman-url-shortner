import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SignupRequestData } from './dto/signup-user-dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from 'src/email/email.service';
import { CryptoService } from './crypto.service';
import { LoginRequestData } from './dto/login-user-dto';
import * as bcrypt from 'bcrypt';
import { MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailVerification } from './email-verification.entity';
import { EmailVerificationPayload } from './interface';
import { JwtPayload } from 'src/types/JwtPayload';
import { EmailMessages } from '../config/messages';
import { ResendEmailVerificationRequestData } from './dto/resend-verification-dto';
import { SendMailRequestData } from '../email/dto/send-mail-request-data';
import { UserService } from '../user/user.service';
import { VerifyTokenRequestData } from './dto/verify-token-request-data';

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
        'Sign Up successful. Verification mail has been sent. Please verify',
    };
  }

  async sendVerificationLink(
    resendEmailVerificationRequestData: ResendEmailVerificationRequestData,
  ) {
    const email = resendEmailVerificationRequestData.email;
    const user = await this.userService.findOneByField('email', email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.verifiedAt) {
      throw new ConflictException('User is already verified');
    }

    await this.emailVerificationRepo.softDelete({
      userId: user.id,
    });

    const payload: EmailVerificationPayload = { email };
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

    const confirmationUrl = `${process.env.EMAIL_CONFIRMATION_URL}?token=${token}`;

    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
      <h2 style="color: #4CAF50;">Welcome to Our Application!</h2>
      <p>Hello <strong>${user.fullName || email}</strong>,</p>
      <p>Thank you for registering. Please confirm your email address by clicking the button below:</p>
      <a 
        href="${confirmationUrl}" 
        style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #4CAF50;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        "
      >
        Confirm Email
      </a>
      <p style="margin-top: 20px; font-size: 0.9em; color: #555;">
        This link will expire in 1 hour. If you did not request this, please ignore this email.
      </p>
    </div>
  `;

    const sendMailRequestData: SendMailRequestData = {
      to: email,
      subject: 'Email Confirmation',
      text: `Welcome to our application. Confirm your email: ${confirmationUrl}`,
      html,
    };

    await this.emailService.sendMail(sendMailRequestData);

    return {
      message: EmailMessages.emailSendSuccess,
    };
  }

  async verify(verifyTokenRequestData: VerifyTokenRequestData) {
    const token = verifyTokenRequestData.token;

    const payload = this.jwtService.verify<EmailVerificationPayload>(token, {
      secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
    });

    const record = await this.emailVerificationRepo.findOne({
      where: { token, expiresAt: MoreThan(new Date()) },
    });

    if (!record) {
      throw new NotFoundException('Token not found or has expired');
    }

    const user = await this.userService.findOneByField('email', payload.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userService.update(user.id, { verifiedAt: new Date() });

    await this.emailVerificationRepo.softDelete({ token });

    return { message: EmailMessages.emailVerifySuccess };
  }

  async login(
    loginRequestData: LoginRequestData,
  ): Promise<{ accessToken: string }> {
    const user = await this.userService.findOneByField(
      'email',
      loginRequestData.email,
    );

    if (!user || !user.verifiedAt) {
      throw new BadRequestException(
        !user
          ? 'User not found'
          : 'User not verified. Please verify before login',
      );
    }

    const match = await bcrypt.compare(
      loginRequestData.password,
      user.password,
    );

    const payload = { sub: user.id, username: user.username };

    if (!match) {
      throw new BadRequestException('Invalid email or password');
    }

    await this.userService.update(user.id, { lastLoginAt: new Date() });

    return { accessToken: await this.jwtService.signAsync(payload) };
  }

  async validateToken(verifyTokenRequestData: {
    token: string;
  }): Promise<JwtPayload> {
    const decoded = await this.jwtService.verifyAsync<JwtPayload>(
      verifyTokenRequestData.token,
      {
        secret: process.env.JWT_SECRET,
      },
    );
    return decoded;
  }
}
