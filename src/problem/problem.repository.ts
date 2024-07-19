import { Injectable } from '@nestjs/common'
import { PrismaService } from '../app.service'

@Injectable()
export class ProblemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProblem(userId: string, classId: string, problemData: any) {
    // course_owner 테이블에서 사용자가 해당 과목을 소유하고 있는지 확인
    const courseOwner = await this.prisma.course_owner.findFirst({
      where: {
        user_id: parseInt(userId),
        course_id: parseInt(classId),
      },
    })

    if (!courseOwner) {
      // 사용자가 해당 과목을 소유하고 있지 않은 경우 에러 throw
      throw new Error('User does not own the specified course')
    }

    return this.prisma.problem_set.create({
      data: {
        ...problemData,
      },
    })
  }

  async updateProblem(userId: string, problemData: any) {
    // course_owner 테이블에서 사용자가 해당 과목을 소유하고 있는지 확인
    const courseOwner = await this.prisma.course_owner.findFirst({
      where: {
        user_id: parseInt(userId),
        course_id: parseInt(problemData.cuid),
      },
    })

    if (!courseOwner) {
      // 사용자가 해당 과목을 소유하고 있지 않은 경우 에러 throw
      throw new Error('User does not own the specified course')
    }

    return this.prisma.problem_set.update({
      where: {
        uid: parseInt(problemData.uid),
        delete_at: null,
      },
      data: {
        ...problemData,
      },
    })
  }

  async isCourseOwner(userId: string, problemId: string) {
    return this.prisma.course_owner.findFirst({
      include: {
        course: true,
      },
      where: {
        user_id: parseInt(userId),
        course: {
          problem_set: {
            some: {
              uid: parseInt(problemId),
              delete_at: null,
            },
          },
        },
      },
    })
  }

  async deleteProblem(userId: string, course_id: string) {
    return this.prisma.problem_set.delete({
      where: {
        uid: parseInt(course_id),
        delete_at: null,
      },
    })
  }

  async submitProblem(userId: string, solutionData: any) {
    return this.prisma.answer_set.create({
      omit: {
        uid: true,
        answer_code: true,
      },
      data: {
        ...solutionData,
      },
    })
  }

  async createAnswer(userId: string, answerData: any) {
    return this.prisma.answer_set.create({
      omit: {
        uid: true,
      },
      data: {
        ...answerData,
      },
    })
  }
}
