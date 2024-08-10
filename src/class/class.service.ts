import { Injectable } from '@nestjs/common'
import { ClassRepository } from './class.repository'
import type { course, whitelist_entries } from '@prisma/client'
import { WhitelistRepository } from '../whitelist/whitelist.repository'

@Injectable()
export class ClassService {
  constructor(
    private readonly classRepository: ClassRepository,
    private readonly whitelistRepository: WhitelistRepository,
  ) {}

  async create(classData: course, classOwner: string) {
    return this.classRepository.create(classData, classOwner)
  }

  async getclasses() {
    return this.classRepository.getclasses()
  }

  async getclass(classId: number) {
    return this.classRepository.getclass(classId)
  }

  async updateclass(userId: string, classData: course) {
    if (!this.classRepository.isClassOwner(userId, classData.uid)) {
      throw new Error('You are not a class owner')
    }
    return this.classRepository.updateclass(userId, classData)
  }

  async deleteclass(userId: string, classData: course) {
    if (!this.classRepository.isClassOwner(userId, classData.uid)) {
      throw new Error('You are not a class owner')
    }
    return this.classRepository.deleteclass(userId, classData)
  }

  async getWhitelist(userId: string, classId: number) {
    if (!this.classRepository.isClassOwner(userId, classId)) {
      throw new Error('You are not a class owner')
    }
    return this.whitelistRepository.getWhitelist(classId)
  }

  async addWhitelist(
    userId: string,
    classId: number,
    whitelist: whitelist_entries[],
  ) {
    if (!this.classRepository.isClassOwner(userId, classId)) {
      throw new Error('You are not a class owner')
    }
    const results = []
    for (const entry of whitelist) {
      try {
        const res =
          await this.whitelistRepository.updateWhitelistAcceptance(entry)
        results.push({ success: true, data: res })
      } catch (e) {
        results.push({ success: false, error: e, data: entry })
      }
    }
    return results
  }

  async deleteWhitelist(
    userId: string,
    classId: number,
    whitelist: whitelist_entries[],
  ) {
    if (!this.classRepository.isClassOwner(userId, classId)) {
      throw new Error('You are not a class owner')
    }
    const results = []
    for (const entry of whitelist) {
      try {
        const res = await this.whitelistRepository.deleteWhitelist(entry)
        results.push({ success: true, data: res })
      } catch (e) {
        results.push({ success: false, error: e, data: entry })
      }
    }
    return results
  }

  async joinClass(userId: string, classId: number) {
    return this.whitelistRepository.createWhitelist(userId, classId)
  }
}
