import 'reflect-metadata';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const typeORMConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/database/core/**/*.entity{.ts,.js}'],
  synchronize: true,
  migrations: ['src/database/migrations/*-migration.ts'],
  logging: Boolean(process.env.DB_LOGGING),
  autoLoadEntities: true,
  cli: {
    migrationsDir: __dirname + './migrations',
  },
} as TypeOrmModuleOptions;

export default typeORMConfig;
