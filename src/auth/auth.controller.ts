import {
  Body,
  ConsoleLogger,
  Controller,
  Delete,
  HttpStatus,
  Post,
  Response,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthLoginDto, AuthRegisterDto } from '../auth/auth.dto'

@Controller('auth')
export class AuthController extends ConsoleLogger {
  constructor(private readonly authService: AuthService) {
    super()
  }

  @Post('login')
  async login(@Body() authLoginDto: AuthLoginDto, @Response() res) {
    this.authService
      .login(authLoginDto)
      .then((token) => {
        res
          .header('Authorization', `Bearer ${token}`)
          .status(HttpStatus.OK)
          .send('로그인에 성공했습니다.')
      })
      .catch((error) => {
        res.status(HttpStatus.UNAUTHORIZED).send('로그인에 실패했습니다.')
      })
  }

  @Post('register')
  async register(@Body() authRegisterDto: AuthRegisterDto, @Response() res) {
    this.authService
      .register(authRegisterDto)
      .then(() => {
        res.status(HttpStatus.CREATED).send('회원가입에 성공했습니다.')
      })
      .catch((error) => {
        res.status(HttpStatus.BAD_REQUEST).send(error.message)
      })
  }

  @Delete('withdraw')
  async withdraw(@Body() body, @Response() res) {
    this.authService
      .withdraw(body.id)
      .then(() => {
        res.status(HttpStatus.OK).send('회원탈퇴에 성공했습니다.')
      })
      .catch(() => {
        res.status(HttpStatus.UNAUTHORIZED).send('회원탈퇴에 실패했습니다.')
      })
  }
}
