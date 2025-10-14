import 'reflect-metadata';
import { DataSource } from 'typeorm';
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: true,
  entities: [__dirname + '/**/*.entity{.js,.ts}'],
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});

export default dataSource;
