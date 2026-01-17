import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { authService } from "@/services/auth-service"
import type { Credentials } from "@/types/auth"

export const useLoginAction = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values: Credentials, recaptchaToken: string) => {
    try {
      setLoading(true)
      setError(null)
      const token = await authService.login(values, recaptchaToken)
      localStorage.setItem("token", token)
      navigate("/dashboard")
    } catch (err) {
      console.error("Login failed", err)
      setError("Błędny login lub niezweryfikowany e-mail. Spróbuj ponownie!")
    } finally {
      setLoading(false)
    }
  }

  return { error, loading, handleLogin }
}
