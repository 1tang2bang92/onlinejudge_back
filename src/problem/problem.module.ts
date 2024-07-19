import { Module } from '@nestjs/common'
import { ProblemService } from './problem.service'
import { AuthModule } from '../auth/auth.module'
import { ProblemController } from './problem.controller'
import { ProblemRepository } from './problem.repository'

@Module({
  imports: [AuthModule],
  controllers: [ProblemController],
  providers: [ProblemService, ProblemRepository],
})
export class ProblemModule {}
