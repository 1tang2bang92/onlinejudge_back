export class AuthLoginDto {
  role: string = ''
  id: string = ''
  password: string = ''
}

export class AuthRegisterDto {
  id: string = ''
  password: string = ''
  nick_name: string = ''
  student_id?: number
}
