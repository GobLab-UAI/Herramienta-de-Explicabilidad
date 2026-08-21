"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Microscope, Briefcase, User } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/lib/mock-api"

const ALL_PROFILES = [
  {
    id: "data-scientist" as UserProfile,
    icon: Microscope,
    title: "Especialista en IA",
    description: "Detalles técnicos, métricas, salidas directas de los explicadores (SHAP, LIME, Anchor)",
  },
  {
    id: "domain-expert" as UserProfile,
    icon: Briefcase,
    title: "Experto en el Dominio",
    description: "Lenguaje natural con contexto especializado desde la base de conocimientos (RAG)",
  },
  {
    id: "non-expert" as UserProfile,
    icon: User,
    title: "Usuario General",
    description: "Lenguaje accesible, ejemplos claros, conclusiones simplificadas (RAG)",
  },
]

export default function ProfilePage() {
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)

  const enabled: UserProfile[] = (() => {
    try {
      const stored = localStorage.getItem("enabledProfiles")
      if (stored) return JSON.parse(stored) as UserProfile[]
    } catch {}
    return ["data-scientist", "domain-expert", "non-expert"]
  })()

  const profiles = ALL_PROFILES.filter((p) => enabled.includes(p.id))

  const handleGenerate = () => {
    // TODO: Backend: call /explain with profile + instance + jobId, return natural/raw/metrics
    if (selectedProfile === "data-scientist") {
      router.push(`/explain/technical?profile=${selectedProfile}`)
    } else {
      router.push(`/explain/natural?profile=${selectedProfile}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Adaptación de la explicación</h1>
            <p className="text-muted-foreground">
              Elige cómo debe presentarse la explicación en función de la audiencia
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {profiles.map((profile) => {
              const Icon = profile.icon
              return (
                <Card
                  key={profile.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-lg",
                    selectedProfile === profile.id && "ring-2 ring-primary shadow-lg",
                  )}
                  onClick={() => setSelectedProfile(profile.id)}
                >
                  <CardHeader className="text-center space-y-4">
                    <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <CardTitle>{profile.title}</CardTitle>
                      <CardDescription className="leading-relaxed">{profile.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/instance">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Link>
            </Button>
            <Button className="flex-1" disabled={!selectedProfile} onClick={handleGenerate}>
              Generar explicación adaptativa
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
