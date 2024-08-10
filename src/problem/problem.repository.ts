import { Injectable } from '@nestjs/common'
import { PrismaService } from '../app.service'
import type { problem_set } from '@prisma/client'

@Injectable()
export class ProblemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProblem(problemData: problem_set) {
    return this.prisma.problem_set.create({
      data: {
        ...problemData,
      },
      omit: {
        uid: true,
        create_at: true,
        delete_at: true,
      },
    })
  }

  async updateProblem(problemData: problem_set) {
    return this.prisma.problem_set.update({
      where: {
        uid: problemData.uid,
        delete_at: null,
      },
      data: {
        ...problemData,
      },
      omit: {
        uid: true,
        delete_at: true,
        create_at: true,
      },
    })
  }

  async deleteProblem(problemId: number) {
    return this.prisma.problem_set.update({
      where: {
        uid: problemId,
        delete_at: null,
      },
      data: {
        delete_at: new Date(),
      },
    })
  }

  async getProblems(classId: number) {
    return this.prisma.problem_set.findMany({
      where: {
        cuid: classId,
        delete_at: null,
      },
      select: {
        uid: true,
        title: true,
        create_at: true,
      },
    })
  }

  async getProblem(problemId: number) {
    return this.prisma.problem_set.findFirst({
      where: {
        uid: problemId,
        delete_at: null,
      },
      select: {
        uid: true,
        title: true,
        body: true,
        create_at: true,
      },
    })
  }
}
