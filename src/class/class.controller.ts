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
import type {
  course,
  problem_set,
  solution_history,
  whitelist_entries,
} from '@prisma/client'
import { ProblemService } from '../problem/problem.service'
import { AnswerService } from '../answer/answer.service'
import { SolutionService } from '../solution/solution.service'

@Controller('course/class')
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly problemService: ProblemService,
    private readonly answerService: AnswerService,
    private readonly solutionService: SolutionService,
  ) {}

  //create
  @Post()
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async create(@Body() classData: course, @Req() request: any) {
    const { classOwner } = request.user.userId
    return this.classService.create(classData, classOwner)
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

  //join class
  @Post(':classId/join')
  @UseGuards(AuthGuard)
  async joinClass(@Req() request: any) {
    const { userId } = request.user
    return this.classService.joinClass(userId, request.params.classId)
  }

  //get white list
  @Get(':classId/whitelist')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async getWhitelist(@Req() request: any) {
    const { userId } = request.user
    return this.classService.getWhitelist(userId, request.params.classId)
  }

  //add white list
  @Post(':classId/whitelist')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async addWhitelist(
    @Req() request: any,
    @Body() whitelist: whitelist_entries[],
  ) {
    const { userId } = request.user
    return this.classService.addWhitelist(
      userId,
      request.params.classId,
      whitelist,
    )
  }

  //delete white list
  @Delete(':classId/whitelist')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async deleteWhitelist(
    @Req() request: any,
    @Body() whitelist: whitelist_entries[],
  ) {
    const { userId } = request.user
    return this.classService.deleteWhitelist(
      userId,
      request.params.classId,
      whitelist,
    )
  }

  //create problem
  @Post(':classId/problem')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async createProblem(@Req() request: any, @Body() problemData: problem_set) {
    const { userId } = request.user
    return this.problemService.createProblem(userId, problemData)
  }

  //update problem
  @Post(':classId/problem/:problemId')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async updateProblem(@Req() request: any, @Body() problemData: problem_set) {
    const { userId } = request.user
    return this.problemService.updateProblem(userId, problemData)
  }

  //delete problem
  @Delete(':classId/problem/:problemId')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async deleteProblem(@Req() request: any) {
    const { userId } = request.user
    return this.problemService.deleteProblem(
      userId,
      request.params.classId,
      request.params.problemId,
    )
  }

  //get problems
  @Get(':classId/problem')
  @UseGuards(AuthGuard)
  async getProblems(@Req() request: any) {
    const { userId } = request.user
    return this.problemService.getProblems(userId, request.params.classId)
  }

  //get problem
  @Get(':classId/problem/:problemId')
  @UseGuards(AuthGuard)
  async getProblem(@Req() request: any) {
    const { userId } = request.user
    return this.problemService.getProblem(
      userId,
      request.params.classId,
      request.params.problemId,
    )
  }

  //submit solution
  @Post(':classId/solution')
  @UseGuards(AuthGuard)
  async submitSolution(
    @Req() request: any,
    @Body() solutionData: solution_history,
  ) {
    const { userId } = request.user
    return this.solutionService.submitSolution(userId, solutionData)
  }

  //get solution
  @Get(':classId/solution/:solutionId')
  @UseGuards(AuthGuard)
  async getSolution(@Req() request: any) {
    const { userId } = request.user
    return this.solutionService.getSolution(
      userId,
      request.params.classId,
      request.params.solutionId,
    )
  }
}
