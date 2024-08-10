import { Module } from '@nestjs/common'
import { ClassController } from './class.controller'
import { ClassService } from './class.service'
import { ClassRepository } from './class.repository'
import { AuthModule } from '../auth/auth.module'
import { ProblemModule } from '../problem/problem.module'
import { WhitelistModule } from '../whitelist/whitelist.module'
import { AnswerService } from '../answer/answer.service'
import { AnswerRepository } from '../answer/answer.repository'
import { SolutionService } from '../solution/solution.service'
import { WhitelistRepository } from '../whitelist/whitelist.repository'
import { SolutionRepository } from '../solution/solution.repository'

@Module({
  imports: [AuthModule, ProblemModule],
  controllers: [ClassController],
  providers: [
    ClassService,
    ClassRepository,
    AnswerService,
    AnswerRepository,
    SolutionService,
    SolutionRepository,
    WhitelistRepository,
  ],
  exports: [ClassRepository],
})
export class ClassModule {}
