import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RateLimitMiddleware } from './middleware/rate-limit-midddleware';

async function bootstrap() {
  const port = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  app.use(new RateLimitMiddleware().use);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(port, '0.0.0.0');
}
bootstrap()
  .then(() => {
    console.log('API started');
  })
  .catch((error) => {
    if (error instanceof Error) throw error;
  });
