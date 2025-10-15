import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RateLimitMiddleware } from './middleware/rate-limit-midddleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(new RateLimitMiddleware().use);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap()
  .then(() => {
    console.log('API started');
  })
  .catch((err) => {
    console.error(err);
  });
