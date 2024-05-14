import { Global, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService, PrismaService } from './app.service'
import { AuthModule } from './auth/auth.module'

@Global()
@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
