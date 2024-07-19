import { Global, Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService, PrismaService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { ClassModule } from './class/class.module'
import { ProblemController } from './problem/problem.controller'
import { ProblemModule } from './problem/problem.module'

@Global()
@Module({
  imports: [AuthModule, ClassModule, ProblemModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
