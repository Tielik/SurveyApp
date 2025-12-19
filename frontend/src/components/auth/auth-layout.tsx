import { cn } from "@/lib/utils"
import type { PropsWithChildren } from "react"

type AuthLayoutProps = PropsWithChildren<{
  className?: string
}>

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100",
        "flex items-center justify-center px-4 py-10",
        className,
      )}
    >
      {children}
    </div>
  )
}
