import {
  CanActivate,
  ConsoleLogger,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { AuthService } from './auth.service'

@Injectable()
export class AuthGuard extends ConsoleLogger implements CanActivate {
  constructor(private readonly authService: AuthService) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    return await this.validateRequest(request)
  }

  async validateRequest(request: any) {
    const jwt = request.headers.bearer
    if (!jwt) {
      return false
    }

    return this.authService
      .verifyToken(jwt)
      .then(() => {
        return true
      })
      .catch(() => {
        return false
      })
  }
}
