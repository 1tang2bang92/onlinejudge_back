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

@Controller('problem')
export class ProblemController {
  constructor(private problemService: ProblemService) {}

  //create
  @Post(':classId')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async createProblem(@Req() request, @Body() problemData: problem_set) {
    if (problemData.cuid != request.params.classId) {
      throw new Error('Invalied class id')
    }
    const { userId } = request.user
    return this.problemService.createProblem(
      userId,
      request.params.classId,
      problemData,
    )
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
    return this.problemService.deleteProblem(userId, request.params.problemId)
  }

  //submit
  @Post('submit')
  @UseGuards(AuthGuard)
  async submitProblem(@Req() request, @Body() solutionData: solution_history) {
    const { userId } = request.user
    return this.problemService.submitProblem(userId, solutionData)
  }

  //answer
  @Post('answer')
  @UseGuards(AuthGuard)
  @Roles('professor', 'admin')
  async createAnswer(@Req() request, @Body() answerData: answer_set) {
    const { userId } = request.user
    return this.problemService.createAnswer(userId, answerData)
  }
}
