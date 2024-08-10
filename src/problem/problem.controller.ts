import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ProblemService } from './problem.service'
import { AuthGuard } from '../auth/auth.guard'
import { Roles } from '../role/role.decorate'
import type { answer_set, problem_set, solution_history } from '@prisma/client'
import { AnswerService } from '../answer/answer.service'

@Controller('problem')
export class ProblemController {
  constructor(
    private readonly problemService: ProblemService,
    private readonly answerService: AnswerService,
  ) {}

  //create
  @Post(':classId')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async createProblem(@Req() request, @Body() problemData: problem_set) {
    if (problemData.cuid != request.params.classId) {
      throw new Error('Invalied class id')
    }
    const { userId } = request.user
    return this.problemService.createProblem(userId, problemData)
  }

  //update
  @Patch(':problemId')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async updateProblem(@Req() request, @Body() problemData: problem_set) {
    if (problemData.uid != request.params.problemId) {
      throw new Error('Invalied problem id')
    }
    const { userId } = request.user
    return this.problemService.updateProblem(userId, problemData)
  }

  //delete
  @Delete(':classId/:problemId')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async deleteProblem(@Req() request) {
    const { userId } = request.user
    return this.problemService.deleteProblem(
      userId,
      request.params.classId,
      request.params.problemId,
    )
  }

  //answer
  @Post(':classId/answer')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async createAnswer(@Req() request, @Body() answerData: answer_set[]) {
    const { userId } = request.user
    return this.answerService.createAnswer(
      userId,
      request.params.classId,
      answerData,
    )
  }
}
