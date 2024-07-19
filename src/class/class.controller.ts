import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ClassService } from './class.service'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../role/role.decorate'
import type { course } from '@prisma/client'

@Controller('course/class')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  //create
  @Post()
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async create(
    @Body() { className }: { className: string },
    @Req() request: any,
  ) {
    const { classOwner } = request.user.userId
    return this.classService.create(className, classOwner)
  }

  //read many
  @Get()
  async getclasses() {
    return this.classService.getclasses()
  }

  //read one
  @Get(':classId')
  async getclass(@Req() request: any) {
    const { classId } = request.params
    return this.classService.getclass(parseInt(classId))
  }

  //update
  @Post(':classId')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async updateclass(@Req() request, @Body() classData: course) {
    if (classData.uid != request.params.classId) {
      throw new Error('Invalied classId')
    }
    const { userId } = request.user
    return this.classService.updateclass(userId, classData)
  }

  //delete
  @Delete(':classId')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async deleteclass(@Req() request: any, classData: course) {
    if (classData.uid != request.params.classId) {
      throw new Error('Invalied classId')
    }
    const { userId } = request.user
    return this.classService.deleteclass(userId, classData)
  }
}
