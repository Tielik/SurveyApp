import { useEffect, useRef } from "react"

type RecaptchaProps = {
  onVerify: (token: string) => void
  onExpired?: () => void
  onError?: () => void
  className?: string
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => number
      reset: (widgetId?: number) => void
    }
  }
}

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ""
let recaptchaPromise: Promise<void> | null = null

const loadRecaptcha = () => {
  if (window.grecaptcha) return Promise.resolve()
  if (recaptchaPromise) return recaptchaPromise

  recaptchaPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit"
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"))
    document.head.appendChild(script)
  })

  return recaptchaPromise
}

export function RecaptchaWidget({ onVerify, onExpired, onError, className }: RecaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!SITE_KEY) return
    let isMounted = true

    loadRecaptcha()
      .then(() => {
        if (!isMounted || !containerRef.current || !window.grecaptcha) return
        if (widgetIdRef.current !== null) return
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: SITE_KEY,
          callback: (token: string) => onVerify(token),
          "expired-callback": () => {
            onVerify("")
            onExpired?.()
          },
          "error-callback": () => {
            onVerify("")
            onError?.()
          },
        })
      })
      .catch(() => {
        onError?.()
      })

    return () => {
      isMounted = false
    }
  }, [onVerify, onExpired, onError])

  if (!SITE_KEY) {
    return <div className="text-sm text-red-600">Brak klucza reCAPTCHA.</div>
  }

  return <div className={className} ref={containerRef} />
}
