import { NestFactory } from '@nestjs/core'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'
import { FastifyAdapter } from '@nestjs/platform-fastify'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter())

  const config = new DocumentBuilder()
    .setTitle('Vision Lab. Hoseo online judge')
    .setDescription('online judge API description')
    .setVersion('1.0')
    .addTag('oj')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(3000)
}
bootstrap()
