import {
  CanActivate,
  ConsoleLogger,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { Reflector } from '@nestjs/core'
import { ROLE_KEY } from '../role/role.decorate'

@Injectable()
export class AuthGuard extends ConsoleLogger implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const roles = this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    return await this.validateRequest(request, roles)
  }

  async validateRequest(request: any, roles: string[]) {
    const jwt = request.headers.bearer
    if (!jwt) {
      return false
    }

    return this.authService
      .verifyToken(jwt)
      .then((token) => {
        return roles &&
          roles.length > 0 &&
          roles.some((role) => token.roles?.includes(role))
          ? false
          : true
      })
      .catch(() => {
        return false
      })
  }
}
