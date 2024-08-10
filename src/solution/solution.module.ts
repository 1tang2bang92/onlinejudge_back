import { Module } from '@nestjs/common'
import { SolutionService } from './solution.service'
import { SolutionRepository } from './solution.repository'
import { WhitelistRepository } from '../whitelist/whitelist.repository'

@Module({
  providers: [SolutionService, SolutionRepository, WhitelistRepository],
  exports: [SolutionService],
})
export class SolutionModule {}
