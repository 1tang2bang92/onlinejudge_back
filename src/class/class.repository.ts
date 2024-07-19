import { Injectable } from '@nestjs/common'
import { PrismaService } from '../app.service'
import type { course } from '@prisma/client'

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(className: string, classOwnerId: string) {
    console.log('classname: ', className)
    return this.prisma.$transaction(async (tx) => {
      const userInfo = await tx.user_info.findFirstOrThrow({
        where: {
          id: classOwnerId,
        },
      })

      const course = await tx.course.create({
        data: {
          board: 0,
          title: className,
        },
      })

      await tx.course_owner.create({
        data: {
          course_id: course.uid,
          user_id: userInfo.uid,
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
}
