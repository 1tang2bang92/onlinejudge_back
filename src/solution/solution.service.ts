import { Injectable } from '@nestjs/common'
import { SolutionRepository } from './solution.repository'
import { WhitelistRepository } from '../whitelist/whitelist.repository'

@Injectable()
export class SolutionService {
  constructor(
    private readonly solutionRepository: SolutionRepository,
    private readonly whitelistRepository: WhitelistRepository,
  ) {}

  async submitSolution(userId: string, solutionData: any) {
    return this.solutionRepository.createSolution(userId, solutionData)
  }

  async getSolution(userId: string, classId: number, solutionId: number) {
    if (!this.whitelistRepository.hasStudent(userId, classId)) {
      throw new Error('User does not own the specified solution')
    }
    return this.solutionRepository.getSolution(solutionId)
  }
}
