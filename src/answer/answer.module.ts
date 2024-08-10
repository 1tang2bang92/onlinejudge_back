import { Module } from '@nestjs/common'
import { AnswerRepository } from './answer.repository'
import { AnswerService } from './answer.service'
import { ClassRepository } from '../class/class.repository'

@Module({
  providers: [AnswerRepository, AnswerService, ClassRepository],
  exports: [AnswerRepository],
})
export class AnswerModule {}
