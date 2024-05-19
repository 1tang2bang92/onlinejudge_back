import { ConsoleLogger, Injectable } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { AuthRepository } from '../auth/auth.repository'
import * as jsonwebtoken from 'jsonwebtoken'
import { AuthLoginDto, AuthRegisterDto } from './auth.dto'

@Injectable()
export class AuthService extends ConsoleLogger {
  constructor(private authRepository: AuthRepository) {
    super()
  }

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.authRepository.findById(authLoginDto.id)
    if (!user) {
      throw new Error('해당 유저가 존재하지 않습니다.')
    }
    const { id, password, ..._ } = user

    const isPasswordMatched = bcrypt.compare(authLoginDto.password, password)
    if (!isPasswordMatched) {
      throw new Error('비밀번호가 일치하지 않습니다.')
    }

    const token = jsonwebtoken.sign(
      {
        userId: id,
        nick_name: user.nick_name,
        student_id: user.student_id,
        role: user.permission_t,
      },
      process.env.JWT_SECRET || 'test',
      { expiresIn: '1h' },
    )
    await this.authRepository.saveToken(id, token)
    return token
  }

  async refresh(refreshToken: any) {
    // verify jwt token
    let decodedToken
    try {
      decodedToken = jsonwebtoken.verify(
        refreshToken,
        process.env.JWT_SECRET || 'test',
      )
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.')
    }

    const userId = decodedToken.userId

    const history = await this.authRepository.findToken(
      userId,
      refreshToken,
      true,
    )

    if (!history || history.token !== refreshToken) {
      throw new Error('유효하지 않은 토큰입니다.')
    }

    const user = await this.authRepository.findById(userId)

    const token = jsonwebtoken.sign(
      {
        userId: user.id,
        nick_name: user.nick_name,
        student_id: user.student_id,
        role: user.permission_t,
      },
      process.env.JWT_SECRET || 'test',
      { expiresIn: '1h' },
    )
    await this.authRepository.saveToken(user.id, token)

    return token
  }

  async register(authRegisterDto: AuthRegisterDto) {
    const { id, password, nick_name, student_id } = authRegisterDto

    const existUser = await this.authRepository.checkExistingUser(
      id,
      nick_name,
      student_id,
    )

    if (existUser.length != 0) {
      throw new Error(
        `Existing user. Duplicated elements: [ ${existUser.join(', ')} ]`,
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    await this.authRepository.createUser(
      id,
      hashedPassword,
      nick_name,
      student_id,
    )
  }

  async logout(token: any) {
    // verify jwt token
    let decodedToken
    try {
      decodedToken = jsonwebtoken.verify(
        token,
        process.env.JWT_SECRET || 'test',
      )
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.')
    }

    const userId = decodedToken.userId
    await this.authRepository.deleteToken(userId, token)
    return true
  }

  async withdraw(id: string) {
    const user = await this.authRepository.findById(id)
    if (!user) {
      throw new Error('해당 유저가 존재하지 않습니다.')
    }

    await this.authRepository.deleteUser(id)
  }

  async verifyToken(jwt: string) {
    // verify jwt token
    let decodedToken
    try {
      decodedToken = jsonwebtoken.verify(jwt, process.env.JWT_SECRET || 'test')
    } catch (error) {
      throw new Error('유효하지 않은 토큰입니다.')
    }

    const userId = decodedToken.userId

    const user = await this.authRepository.findById(userId)
    if (!user) {
      super.warn('해당 유저가 존재하지 않습니다. (key가 유출되었을 수 있음)')
      super.warn('해당 유저가 존재하지 않습니다. (key가 유출되었을 수 있음)')
      super.warn('해당 유저가 존재하지 않습니다. (key가 유출되었을 수 있음)')
      throw new Error('해당 유저가 존재하지 않습니다.')
    }

    const savedToken = await this.authRepository.findToken(userId, jwt)

    if (!savedToken || savedToken.token !== jwt) {
      throw new Error('유효하지 않은 토큰입니다.')
    }

    return decodedToken
  }
}
