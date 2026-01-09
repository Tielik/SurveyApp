export type Credentials = {
  username: string
  password: string
}

export type RegisterCredentials = Credentials & {
  email: string
}

export type AuthTokenResponse = {
  token: string
}
