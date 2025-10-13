import 'reflect-metadata';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { EmailVerification } from './email/email-verification.entity';

const typeORMConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, EmailVerification],
  synchronize: true,
  migrations: ['src/database/migrations/*-migration.ts'],
  logging: Boolean(process.env.DB_LOGGING),
  autoLoadEntities: true,
} as TypeOrmModuleOptions;

export default typeORMConfig;
