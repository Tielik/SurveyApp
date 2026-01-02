import { useState } from "react"
import { Loader2, LockKeyhole, User } from "lucide-react"

import { RecaptchaWidget } from "@/components/recaptcha"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Credentials } from "@/types/auth"

type CredentialsFormProps = {
  submitLabel: string
  loadingLabel: string
  onSubmit: (values: Credentials, recaptchaToken: string) => Promise<void>
  error?: string | null
  loading?: boolean
  usernameAutocomplete?: string
  passwordAutocomplete?: string
  className?: string
}

export function CredentialsForm({
  submitLabel,
  loadingLabel,
  onSubmit,
  error,
  loading = false,
  usernameAutocomplete = "username",
  passwordAutocomplete = "current-password",
  className,
}: CredentialsFormProps) {
  const [values, setValues] = useState<Credentials>({ username: "", password: "" })
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)

  const handleChange = (field: keyof Credentials) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!recaptchaToken) {
      setRecaptchaError("Potwierdz reCAPTCHA.")
      return
    }
    setRecaptchaError(null)
    await onSubmit(values, recaptchaToken)
  }

  const isDisabled = loading || !values.username || !values.password || !recaptchaToken

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Nie udało się</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Login</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="username"
              name="username"
              placeholder="np. jan.kowalski"
              value={values.username}
              onChange={(event) => handleChange("username")(event.target.value)}
              className="pl-10"
              autoComplete={usernameAutocomplete}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <div className="relative">
            <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Twoje hasło"
              value={values.password}
              onChange={(event) => handleChange("password")(event.target.value)}
              className="pl-10"
              autoComplete={passwordAutocomplete}
              required
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <RecaptchaWidget
          onVerify={(token) => {
            setRecaptchaToken(token)
            if (token) setRecaptchaError(null)
          }}
          onExpired={() => setRecaptchaToken("")}
          onError={() => setRecaptchaError("Blad reCAPTCHA. Sprobuj ponownie.")}
          className="inline-block"
        />
        {recaptchaError && <p className="text-sm text-red-500">{recaptchaError}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isDisabled}>
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            {loadingLabel}
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
