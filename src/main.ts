import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { FastifyAdapter } from '@nestjs/platform-fastify'
import { Transport } from '@nestjs/microservices'
import { env } from 'process'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter(), {
    logger: ['error', 'warn'],
  })

  const config = new DocumentBuilder()
    .setTitle('Vision Lab. Hoseo online judge')
    .setDescription('online judge API description')
    .setVersion('1.0')
    .addTag('oj')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  app.connectMicroservice({
    transport: Transport.NATS,
    options: {
      url: 'nats://localhost:4222',
      queue: 'oj',
    },
  })

  await app.startAllMicroservices()
  await app.listen(3000, '0.0.0.0')
}
bootstrap()
