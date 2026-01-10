import { apiClient } from "@/services/api-client"
import type {AuthTokenResponse, Credentials, RegisterCredentials} from "@/types/auth"

export const authService = {
  async login(credentials: Credentials, recaptchaToken: string): Promise<string> {
    const { data } = await apiClient.post<AuthTokenResponse>("/api-token-auth/", {
      username: credentials.username,
      password: credentials.password,
      recaptcha_token: recaptchaToken,
    })
    return data.token
  },

  async register(credentials: RegisterCredentials, recaptchaToken: string): Promise<void> {
    await apiClient.post("/api/register/", {
      email: credentials.email,
      username: credentials.username,
      password: credentials.password,
      recaptcha_token: recaptchaToken,
    })
  },
}
