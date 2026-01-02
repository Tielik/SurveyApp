import { AuthCard } from "@/components/auth/auth-card"
import { AuthLayout } from "@/components/auth/auth-layout"
import { CredentialsForm } from "@/components/auth/credentials-form"
import type { Credentials } from "@/types/auth"

type Props = {
  error: string | null
  loading: boolean
  onSubmit: (values: Credentials) => Promise<void>
}

export default function RegisterView({ error, loading, onSubmit }: Props) {
  return (
    <AuthLayout>
      <AuthCard
        title="Do‘'Žcz do nas"
        description="Zaloz konto i zacznij zbierac odpowiedzi."
        actionHref="/"
        actionLabel="Masz juz konto? Zaloguj sie"
        actionIcon="login"
      >
        <CredentialsForm
          submitLabel="Zaloz konto"
          loadingLabel="Tworzenie konta..."
          onSubmit={onSubmit}
          error={error}
          loading={loading}
          passwordAutocomplete="new-password"
        />
      </AuthCard>
    </AuthLayout>
  )
}
