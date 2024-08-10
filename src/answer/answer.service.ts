import { Injectable } from '@nestjs/common'
import type { answer_set } from '@prisma/client'
import { ClassRepository } from '../class/class.repository'
import { AnswerRepository } from './answer.repository'

@Injectable()
export class AnswerService {
  constructor(
    private readonly answerRepository: AnswerRepository,
    private readonly classRepository: ClassRepository,
  ) {}

  async createAnswer(
    userId: string,
    classId: number,
    answerData: answer_set[],
  ) {
    if (!this.classRepository.isClassOwner(userId, classId)) {
      throw new Error('User does not own the specified course')
    }
    const results = []
    for (const entry of answerData) {
      try {
        const res = await this.answerRepository.createAnswer(userId, entry)
        results.push({ success: true, data: res })
      } catch (e) {
        results.push({ success: false, error: e, data: entry })
      }
    }
    return results
  }
}
