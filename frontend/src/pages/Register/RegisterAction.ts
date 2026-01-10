import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { authService } from "@/services/auth-service"
import type { RegisterCredentials } from "@/types/auth"

export const useRegisterAction = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (values: RegisterCredentials, recaptchaToken: string) => {
    try {
      setLoading(true)
      setError(null)
      await authService.register(values, recaptchaToken)
      navigate("/")
    } catch (err) {
      console.error("Registration failed", err)
      setError("Nie udało się utworzyć konta. Upewnij się, że login jest unikalny oraz nie zawiera spacji.")
    } finally {
      setLoading(false)
    }
  }

  return { error, loading, handleRegister }
}
