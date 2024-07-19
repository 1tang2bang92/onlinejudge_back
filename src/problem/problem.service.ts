import { Injectable } from '@nestjs/common'
import { ProblemRepository } from './problem.repository'

@Injectable()
export class ProblemService {
  constructor(private readonly problemRepository: ProblemRepository) {}

  async createProblem(userId: string, classId: string, problemData: any) {
    return this.problemRepository.createProblem(userId, classId, problemData)
  }

  async updateProblem(userId: string, problemData: any) {
    return this.problemRepository.updateProblem(userId, problemData)
  }

  async deleteProblem(userId: string, problemId: string) {
    if (!this.problemRepository.isCourseOwner(userId, problemId)) {
      throw new Error('User does not own the specified course')
    }
    return this.problemRepository.deleteProblem(userId, problemId)
  }

  async submitProblem(userId: string, solutionData: any) {
    if (!this.problemRepository.isCourseOwner(userId, solutionData.problemId)) {
      throw new Error('User does not own the specified course')
    }
    return this.problemRepository.submitProblem(userId, solutionData)
  }

  async createAnswer(userId: string, answerData: any) {
    if (!this.problemRepository.isCourseOwner(userId, answerData.problemId)) {
      throw new Error('User does not own the specified course')
    }
    return this.problemRepository.createAnswer(userId, answerData)
  }
}
