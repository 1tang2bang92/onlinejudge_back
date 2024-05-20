import { Injectable } from '@nestjs/common'
import { AppService, PrismaService } from '../app.service'

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.user_info.findFirst({
      where: {
        id,
      },
    })
  }

  async checkExistingUser(
    id: string,
    nick_name: string,
    student_id: number,
  ): Promise<string[]> {
    const duplicateElements: string[] = []

    const existUser = await this.prisma.user_info.findFirst({
      where: {
        OR: [{ id }, { nick_name }, { student_id }],
      },
    })

    if (existUser) {
      if (existUser.id === id) {
        duplicateElements.push('id')
      }
      if (existUser.nick_name === nick_name) {
        duplicateElements.push('nickname')
      }
      if (existUser.student_id === student_id) {
        duplicateElements.push('studentId')
      }
    }

    return duplicateElements
  }

  async createUser(
    id: string,
    password: string,
    nick_name: string,
    student_id: number,
  ): Promise<void> {
    await this.prisma.user_info.create({
      data: {
        id,
        password,
        nick_name,
        student_id,
      },
    })
  }

  async saveToken(userId: string, token: string): Promise<void> {
    await this.prisma.login.create({
      data: {
        user_id: userId,
        token,
        expire_at: new Date(Date.now() + 1000 * 60 * 60),
      },
    })
  }

  async deleteToken(userId: any, token: any) {
    await this.prisma.login.deleteMany({
      where: {
        AND: [userId, token],
      },
    })
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user_info.updateMany({
      where: { id: id },
      data: { delete_at: new Date() },
    })
  }

  async findToken(
    userId: string,
    token: string,
    refreshToken: boolean = false,
  ) {
    if (refreshToken) {
      return this.prisma.login.findFirst({
        where: {
          user_id: userId,
          AND: {
            expire_at: {
              gte: new Date(new Date().getTime() + 1000 * 60 * 10),
            },
          },
        },
        orderBy: {
          create_at: 'desc',
        },
      })
    }
    return this.prisma.login.findFirst({
      where: {
        user_id: userId,
        AND: {
          expire_at: {
            gte: new Date(),
          },
          token,
        },
      },
      orderBy: {
        create_at: 'desc',
      },
    })
  }
}
