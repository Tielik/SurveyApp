import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { authService } from "@/services/auth-service"
import type { Credentials } from "@/types/auth"

export const useRegisterAction = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (values: Credentials, recaptchaToken: string) => {
    try {
      setLoading(true)
      setError(null)
      await authService.register(values, recaptchaToken)
      navigate("/")
    } catch (err) {
      console.error("Registration failed", err)
      setError("Nie udalo sie utworzyc konta. Upewnij sie, ze login jest unikalny.")
    } finally {
      setLoading(false)
    }
  }

  return { error, loading, handleRegister }
}
