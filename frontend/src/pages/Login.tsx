import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { AuthCard } from "@/components/auth/auth-card"
import { AuthLayout } from "@/components/auth/auth-layout"
import { CredentialsForm } from "@/components/auth/credentials-form"
import { routes } from "@/routes"
import { authService } from "@/services/auth-service"
import type { Credentials } from "@/types/auth"

export default function Login() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values: Credentials) => {
    try {
      setLoading(true)
      setError(null)
      const token = await authService.login(values)
      localStorage.setItem("token", token)
      navigate(routes.dashboard)
    } catch (err) {
      console.error("Login failed", err)
      setError("Błędny login lub hasło. Spróbuj ponownie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Witaj ponownie"
        description="Zaloguj się, aby zarządzać ankietami."
        actionHref="/register"
        actionHref={routes.register}
        actionLabel="Nie masz konta? Zarejestruj się"
        actionIcon="register"
      >
        <CredentialsForm
          submitLabel="Zaloguj się"
          loadingLabel="Logowanie..."
          onSubmit={handleLogin}
          error={error}
          loading={loading}
        />
      </AuthCard>
    </AuthLayout>
  )
}
