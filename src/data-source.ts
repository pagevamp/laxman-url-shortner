import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
export const dataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: true,
  entities: ['./dist/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
} as DataSourceOptions;

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
