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
    const authHeader = request.headers.authorization
    if (!authHeader) {
      return false
    }

    const [bearer, jwt] = authHeader.split(' ')
    if (bearer !== 'Bearer' || !jwt) {
      return false
    }

    try {
      const decodedToken = await this.authService.verifyToken(jwt)
      request.user = {
        userId: decodedToken.userId,
        role: decodedToken.role,
      }
      return roles &&
        roles.length > 0 &&
        roles.some((role) => decodedToken.roles?.includes(role))
        ? false
        : true
    } catch {
      return false
    }
  }
}
