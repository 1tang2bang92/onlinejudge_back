import { Injectable } from '@nestjs/common'
import { ClassRepository } from './class.repository'
import type { course } from '@prisma/client'

@Injectable()
export class ClassService {
  constructor(private readonly classRepository: ClassRepository) {}

  async create(className: string, classOwner: string) {
    return this.classRepository.create(className, classOwner)
  }

  async getclasses() {
    return this.classRepository.getclasses()
  }

  async getclass(classId: number) {
    return this.classRepository.getclass(classId)
  }

  async updateclass(userId: string, classData: course) {
    return this.classRepository.updateclass(userId, classData)
  }

  async deleteclass(userId: string, classData: course) {
    return this.classRepository.deleteclass(userId, classData)
  }
}
