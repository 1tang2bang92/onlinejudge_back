import { Injectable } from '@nestjs/common'
import { PrismaService } from '../app.service'
import type { course } from '@prisma/client'

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(courseData: course, classOwnerId: string) {
    return this.prisma.$transaction(async (tx) => {
      const { uid } = await tx.course.create({
        data: {
          board: 0,
          ...courseData,
        },
        select: {
          uid: true,
        },
      })

      const course = await tx.course_owner.create({
        data: {
          course: {
            connect: { uid },
          },
          user_info: {
            connect: {
              id: classOwnerId,
            },
          },
        },
      })

      return course
    })
  }

  async getclasses() {
    return this.prisma.course.findMany({
      take: 10,
      skip: 0,
      where: {
        board: 0,
        delete_at: null,
      },
      select: {
        uid: true,
        title: true,
        open: true,
        close: true,
        create_at: true,
        course_owner: {
          select: {
            user_info: {
              select: {
                nick_name: true,
              },
            },
          },
        },
        _count: {
          select: {
            problem_set: true,
          },
        },
      },
    })
  }

  async getclass(classId: number) {
    return this.prisma.course.findFirst({
      where: {
        board: 0,
        uid: classId,
        delete_at: null,
      },
      include: {
        course_owner: {
          select: {
            user_info: {
              select: {
                nick_name: true,
              },
            },
          },
        },
        problem_set: {
          where: {
            delete_at: null,
          },
        },
      },
    })
  }

  async updateclass(userId: string, data: course) {
    return this.prisma.course.update({
      where: {
        uid: data.uid,
        board: 0,
        delete_at: null,
        course_owner: {
          some: {
            user_info: {
              id: userId,
            },
          },
        },
      },
      data,
    })
  }

  async deleteclass(userId: string, data: course) {
    return this.prisma.course.update({
      where: {
        uid: data.uid,
        board: 0,
        delete_at: null,
        course_owner: {
          some: {
            user_info: {
              id: userId,
            },
          },
        },
      },
      data: {
        delete_at: new Date(),
      },
    })
  }

  async isClassOwner(userId: string, classId: number) {
    return this.prisma.course_owner.findFirst({
      where: {
        user_info: {
          id: userId,
        },
        course_id: classId,
      },
    })
  }
}
