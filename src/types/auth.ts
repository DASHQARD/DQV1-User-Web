export type CreateAccountData = {
  user_type: 'user' | 'corporate' | 'vendor'
  email: string
  password: string
}

export type LoginData = {
  email: string
  password: string
}
