import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import configuration from './config/configuration';

const PORT = configuration().PORT;
const APP_URL = configuration().APP_URL;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  await app.listen(PORT, '0.0.0.0', () => {
    console.info(`Server is running on ${APP_URL}`);
  });
}
bootstrap();
