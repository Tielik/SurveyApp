import { cn } from "@/lib/utils"
import type { PropsWithChildren } from "react"

type AuthLayoutProps = PropsWithChildren<{
  className?: string
}>

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-gradient-to-br from-slate-50 via-indigo-50 to-cyan-50",
        "flex items-center justify-center px-4 py-10",
        className,
      )}
    >
      {children}
    </div>
  )
}
