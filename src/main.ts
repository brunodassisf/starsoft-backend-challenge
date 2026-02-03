import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Cine Starsoft')
    .setDescription('API para gerenciamento de sessões e reservas de assentos em eventos de cinema.')
    .setVersion('1.0')
    .build();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@rabbitmq:5672'],
      queue: 'pedidos_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 API rodando em: http://localhost:${port}`);
  console.log(`Ready to receive Redis messages...`);
}
bootstrap();