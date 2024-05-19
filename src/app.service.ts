import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super()
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
