import { useState } from "react"
import { Loader2, LockKeyhole, User } from "lucide-react"

import { RecaptchaWidget } from "@/components/recaptcha"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { Credentials, RegisterCredentials } from "@/types/auth"

type BaseProps = {
  submitLabel: string
  loadingLabel: string
  error?: string | null
  loading?: boolean
  usernameAutocomplete?: string
  passwordAutocomplete?: string
  className?: string
}

type LoginProps = BaseProps & {
  variant?: "login"
  onSubmit: (values: Credentials, recaptchaToken: string) => Promise<void>
}

type RegisterProps = BaseProps & {
  variant: "register"
  onSubmit: (values: RegisterCredentials, recaptchaToken: string) => Promise<void>
}

type CredentialsFormProps = LoginProps | RegisterProps

type FormValues = {
  username: string
  password: string
  email?: string
}

export function CredentialsForm(props: CredentialsFormProps) {
  const {
    submitLabel,
    loadingLabel,
    error,
    loading = false,
    usernameAutocomplete = "username",
    passwordAutocomplete = "current-password",
    className,
  } = props
  const isRegister = props.variant === "register"
  const [values, setValues] = useState<FormValues>(
    isRegister ? { username: "", password: "", email: "" } : { username: "", password: "" }
  )
  const [recaptchaToken, setRecaptchaToken] = useState("")
  const [recaptchaError, setRecaptchaError] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const handleChange = (field: keyof FormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasSubmitted(true)
    if (!recaptchaToken) {
      setRecaptchaError("Potwierdz reCAPTCHA.")
      return
    }
    setRecaptchaError(null)
    if (isRegister) {
      const email = values.email?.trim()
      if (!email) {
        setRecaptchaError("Podaj adres email.")
        return
      }
      const payload: RegisterCredentials = {
        username: values.username,
        password: values.password,
        email,
      }
      await props.onSubmit(payload, recaptchaToken)
      return
    }
    await props.onSubmit({ username: values.username, password: values.password }, recaptchaToken)
  }

  const isDisabled =
    loading || !values.username || !values.password || (isRegister && !values.email) || !recaptchaToken

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-6", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Nie udało się</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {isRegister && (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@domena.pl"
                value={values.email ?? ""}
                onChange={(event) => handleChange("email")(event.target.value)}
                className="pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>
        )}
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
        {hasSubmitted && recaptchaError && <p className="text-sm text-red-500">{recaptchaError}</p>}
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
