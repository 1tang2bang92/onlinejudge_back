import { Injectable } from '@nestjs/common'
import { PrismaService } from '../app.service'
import type { whitelist_entries } from '@prisma/client'

@Injectable()
export class WhitelistRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getWhitelist(classId: number) {
    return this.prisma.whitelist_entries.findMany({
      where: {
        cid: classId,
        delete_at: null,
      },
    })
  }

  async createWhitelist(userId: string, classId: number) {
    return this.prisma.whitelist_entries.create({
      data: {
        course: {
          connect: {
            uid: classId,
          },
        },
        user_info: {
          connect: {
            id: userId,
          },
        },
      },
    })
  }

  async updateWhitelistAcceptance(whitelist: whitelist_entries) {
    return this.prisma.whitelist_entries.update({
      where: {
        uid: whitelist.uid,
        cid: whitelist.cid,
        user_id: whitelist.user_id,
      },
      data: {
        accept: true,
      },
    })
  }

  async deleteWhitelist(whitelist: whitelist_entries) {
    return this.prisma.whitelist_entries.update({
      where: {
        uid: whitelist.uid,
        cid: whitelist.cid,
        user_id: whitelist.user_id,
      },
      data: {
        delete_at: new Date(),
      },
    })
  }

  async hasStudent(userId: string, classId: number) {
    return this.prisma.whitelist_entries.findFirst({
      where: {
        cid: classId,
        user_info: {
          id: userId,
        },
        delete_at: null,
      },
    })
  }
}
