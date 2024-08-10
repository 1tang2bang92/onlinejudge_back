import { Injectable } from '@nestjs/common'
import { PrismaService } from '../app.service'

@Injectable()
export class AnswerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAnswer(userId: string, answerData: any) {
    return this.prisma.answer_set.create({
      data: {
        ...answerData,
      },
    })
  }
}
