import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super()
  }

  @Inject()
  async onModuleInit() {
    await this.$connect()
  }

  destory() {
    return this.$disconnect()
  }
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!'
  }
}
