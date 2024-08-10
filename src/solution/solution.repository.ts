import { Injectable } from '@nestjs/common'
import { PrismaService } from '../app.service'

@Injectable()
export class SolutionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSolution(userId: string, solutionData: any) {
    return this.prisma.solution_history.create({
      data: {
        user_info: {
          connect: {
            id: userId,
          },
        },
        ...solutionData,
      },
      omit: {
        uid: true,
        result_t: true,
        memory: true,
        runtime: true,
        create_at: true,
      },
    })
  }

  async getSolution(solutionId: number) {
    return this.prisma.solution_history.findFirst({
      where: {
        uid: solutionId,
      },
    })
  }

  async getSolutionHistory(userId: string, courseId: number) {
    return this.prisma.solution_history.findMany({
      where: {
        user_info: {
          id: userId,
        },
        problem_set: {
          course: {
            uid: courseId,
          },
        },
      },
    })
  }
}
