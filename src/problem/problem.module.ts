import { Module } from '@nestjs/common'
import { ProblemService } from './problem.service'
import { AuthModule } from '../auth/auth.module'
import { ProblemController } from './problem.controller'
import { ProblemRepository } from './problem.repository'
import { ClassRepository } from '../class/class.repository'
import { AnswerRepository } from '../answer/answer.repository'
import { AnswerService } from '../answer/answer.service'
import { SolutionRepository } from '../solution/solution.repository'
import { SolutionService } from '../solution/solution.service'
import { WhitelistRepository } from '../whitelist/whitelist.repository'

@Module({
  imports: [AuthModule],
  controllers: [ProblemController],
  providers: [
    ProblemService,
    ProblemRepository,
    ClassRepository,
    AnswerRepository,
    AnswerService,
    WhitelistRepository,
  ],
  exports: [ProblemService],
})
export class ProblemModule {}
