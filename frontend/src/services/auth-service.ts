import { apiClient } from "@/services/api-client"
import type { AuthTokenResponse, Credentials } from "@/types/auth"

export const authService = {
  async login(credentials: Credentials): Promise<string> {
    const { data } = await apiClient.post<AuthTokenResponse>("/api-token-auth/", {
      username: credentials.username,
      password: credentials.password,
    })
    return data.token
  },

  async register(credentials: Credentials): Promise<void> {
    await apiClient.post("/api/register/", {
      username: credentials.username,
      password: credentials.password,
    })
  },
}
