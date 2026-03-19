import type { ReactNode } from "react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 justify-center items-center">
        {children}
      </div>
    </div>
  )
}
