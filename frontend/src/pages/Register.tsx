import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { AuthCard } from "@/components/auth/auth-card"
import { AuthLayout } from "@/components/auth/auth-layout"
import { CredentialsForm } from "@/components/auth/credentials-form"
import { authService } from "@/services/auth-service"
import type { Credentials } from "@/types/auth"

export default function Register() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async (values: Credentials) => {
    try {
      setLoading(true)
      setError(null)
      await authService.register(values)
      navigate("/")
    } catch (err) {
      console.error("Registration failed", err)
      setError("Nie udało się utworzyć konta. Upewnij się, że login jest unikalny.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Dołącz do nas"
        description="Załóż konto i zacznij zbierać odpowiedzi."
        actionHref="/"
        actionLabel="Masz już konto? Zaloguj się"
        actionIcon="login"
      >
        <CredentialsForm
          submitLabel="Załóż konto"
          loadingLabel="Tworzenie konta..."
          onSubmit={handleRegister}
          error={error}
          loading={loading}
          passwordAutocomplete="new-password"
        />
      </AuthCard>
    </AuthLayout>
  )
}
