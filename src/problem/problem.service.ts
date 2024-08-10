import { Injectable } from '@nestjs/common'
import { ProblemRepository } from './problem.repository'
import { ClassRepository } from '../class/class.repository'
import type { problem_set } from '@prisma/client'
import { WhitelistRepository } from '../whitelist/whitelist.repository'

@Injectable()
export class ProblemService {
  constructor(
    private readonly problemRepository: ProblemRepository,
    private readonly classRepository: ClassRepository,
    private readonly whitelistRepository: WhitelistRepository,
  ) {}

  async createProblem(userId: string, problemData: problem_set) {
    if (!this.classRepository.isClassOwner(userId, problemData.cuid)) {
      throw new Error('User does not own the specified course')
    }
    return this.problemRepository.createProblem(problemData)
  }

  async updateProblem(userId: string, problemData: problem_set) {
    if (!this.classRepository.isClassOwner(userId, problemData.cuid)) {
      throw new Error('User does not own the specified course')
    }
    return this.problemRepository.updateProblem(problemData)
  }

  async deleteProblem(userId: string, classId: number, problemId: number) {
    if (!this.classRepository.isClassOwner(userId, classId)) {
      throw new Error('User does not own the specified course')
    }
    return this.problemRepository.deleteProblem(problemId)
  }

  async getProblems(userId: string, classId: number) {
    if (!this.whitelistRepository.hasStudent(userId, classId)) {
      throw new Error('User does not own the specified course')
    }
    return this.problemRepository.getProblems(classId)
  }

  async getProblem(userId: string, classId: number, problemId: number) {
    if (!this.whitelistRepository.hasStudent(userId, classId)) {
      throw new Error('User does not own the specified course')
    }
    return this.problemRepository.getProblem(problemId)
  }
}
