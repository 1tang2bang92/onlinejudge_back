import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { env } from 'process'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    if (env.NODE_ENV === 'production') {
      super({ log: ['warn', 'error'] })
    } else {
      super({ log: ['query', 'info', 'warn', 'error'] })
    }
  }

  @Inject()
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    return this.$disconnect()
  }
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }
}
