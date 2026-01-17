import { AuthCard } from "@/components/auth/auth-card"
import { AuthLayout } from "@/components/auth/auth-layout"
import { CredentialsForm } from "@/components/auth/credentials-form"
import type { Credentials } from "@/types/auth"

type Props = {
  error: string | null
  loading: boolean
  onSubmit: (values: Credentials, recaptchaToken: string) => Promise<void>
}

export default function LoginView({ error, loading, onSubmit }: Props) {
  return (
    <AuthLayout>
      <AuthCard
        title="Witaj ponownie"
        description="Zaloguj się, aby zarządzać ankietami"
        actionHref="/register"
        actionLabel="Nie masz konta? Zarejestruj się"
        actionIcon="register"
      >
        <CredentialsForm
          submitLabel="Zaloguj się"
          loadingLabel="Logowanie..."
          onSubmit={onSubmit}
          error={error}
          loading={loading}
        />
      </AuthCard>
    </AuthLayout>
  )
}
