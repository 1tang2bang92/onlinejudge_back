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
    try {
      const token = await this.authService.login(authLoginDto)
      res.setHeader('Authorization', `Bearer ${token}`)
      res.status(HttpStatus.OK).json({ 
        success: true,
        message: 'Login successful',
        data: { token }
      })
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ 
        success: false,
        message: error.message 
      })
    }
  }

  @Post('refresh')
  async refresh(@Body() body, @Response() res) {
    try {
      const token = await this.authService.refresh(body.refreshToken)
      res.setHeader('Authorization', `Bearer ${token}`)
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Token refreshed successfully',
        data: { token }
      })
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: error.message
      })
    }
  }

  @Post('register')
  async register(@Body() authRegisterDto: AuthRegisterDto, @Response() res) {
    try {
      await this.authService.register(authRegisterDto)
      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Registration successful'
      })
    } catch (error) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message
      })
    }
  }

  @Delete('logout')
  async logout(@Body() body, @Response() res) {
    try {
      await this.authService.logout(body.token)
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logout successful'
      })
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: error.message
      })
    }
  }

  @Delete('withdraw')
  async withdraw(@Body() body, @Response() res) {
    try {
      await this.authService.withdraw(body.id)
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Account withdrawal successful'
      })
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: error.message
      })
    }
  }
}