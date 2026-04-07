import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Navbar() {
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Sparkles className="h-6 w-6 text-primary" />
          <span>Profile XAI</span>
        </Link>
      </div>
    </nav>
  )
}
