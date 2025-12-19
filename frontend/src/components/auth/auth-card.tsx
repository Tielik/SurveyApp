import { LogIn, UserPlus } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type AuthCardProps = {
  title: string
  description: string
  actionHref: string
  actionLabel: string
  actionIcon?: "login" | "register"
  children: React.ReactNode
  className?: string
}

export function AuthCard({
  title,
  description,
  actionHref,
  actionLabel,
  actionIcon = "login",
  children,
  className,
}: AuthCardProps) {
  const Icon = actionIcon === "login" ? LogIn : UserPlus

  return (
    <Card className={cn("w-full max-w-md backdrop-blur", className)}>
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="mt-1 text-base text-muted-foreground">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
      <CardFooter className="justify-center border-t bg-muted/30">
        <Button asChild variant="link" className="text-sm">
          <Link to={actionHref} className="flex items-center gap-2">
            <Icon size={16} />
            {actionLabel}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
