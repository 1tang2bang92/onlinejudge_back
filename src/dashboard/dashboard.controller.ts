import { Controller, Post, Sse } from '@nestjs/common'
import { Subject } from 'rxjs'
import { DashboardService } from './dashboard.service'

@Controller('dashboard')
export class DashboardController {
  private messageSubject = new Subject()

  constructor(private readonly dashboardService: DashboardService) {}

  @Sse('status')
  async status() {
    return this.messageSubject.asObservable()
  }
}
