import 'reflect-metadata';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';

const typeORMConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '**/*.entity.ts')],
  synchronize: false,
  migrations: [join(__dirname, 'migration/*.ts')],
  migrationsTableName: 'custom_migration_table',
  logging: Boolean(process.env.DB_LOGGING),
  autoLoadEntities: true,
  cli: {
    migrationsDir: __dirname + './migrations',
  },
} as TypeOrmModuleOptions;

export default typeORMConfig;
