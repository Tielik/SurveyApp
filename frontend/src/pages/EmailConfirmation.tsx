import { AuthCard } from "@/components/auth/auth-card"
import { AuthLayout } from "@/components/auth/auth-layout"
import { useSearchParams } from "react-router-dom"

export default function MailConfirmationView() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get("status")

  if (!status) {
    return (
      <AuthLayout>
        <AuthCard
          title="Brak dostępu"
          description="Nie możesz wejść na tę stronę bezpośrednio. Użyj linku weryfikacyjnego wysłanego na Twój e-mail"
          actionHref="/"
          actionLabel="Wróć do logowania"
        >
          <></>
        </AuthCard>
      </AuthLayout>
    )
  }


  if (status === "error") {
    return (
      <AuthLayout>
        <AuthCard
          title="Błąd weryfikacji"
          description="Link weryfikacyjny jest nieprawidłowy lub wygasł"
          actionHref="/"
          actionLabel="Wróć do logowania"
        >
          <></>
        </AuthCard>

      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Sukces!"
        description="Twój adres email został pomyślnie potwierdzony"
        actionHref="/"
        actionLabel="Wróć do logowania"
      >
        <></>
      </AuthCard>
    </AuthLayout>
  )
}