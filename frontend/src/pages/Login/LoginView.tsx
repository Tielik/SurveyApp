import { AuthCard } from "@/components/auth/auth-card"
import { AuthLayout } from "@/components/auth/auth-layout"
import { CredentialsForm } from "@/components/auth/credentials-form"
import type { Credentials } from "@/types/auth"

type Props = {
  error: string | null
  loading: boolean
  onSubmit: (values: Credentials) => Promise<void>
}

export default function LoginView({ error, loading, onSubmit }: Props) {
  return (
    <AuthLayout>
      <AuthCard
        title="Witaj ponownie"
        description="Zaloguj sie, aby zarzadzac ankietami."
        actionHref="/register"
        actionLabel="Nie masz konta? Zarejestruj sie"
        actionIcon="register"
      >
        <CredentialsForm
          submitLabel="Zaloguj sie"
          loadingLabel="Logowanie..."
          onSubmit={onSubmit}
          error={error}
          loading={loading}
        />
      </AuthCard>
    </AuthLayout>
  )
}
