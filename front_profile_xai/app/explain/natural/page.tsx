"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/navbar"
import { ChatPanel } from "@/components/chat-panel"
import { generateExplanation, chatRag, type ChatMessage, type UserProfile } from "@/lib/mock-api"
import { Loader2 } from "lucide-react"

export default function NaturalExplanationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const profile = searchParams.get("profile") as UserProfile

  const [explanation, setExplanation] = useState<string>("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isChatLoading, setIsChatLoading] = useState(false)

useEffect(() => {
    // 1. Recuperamos la instancia de la memoria del navegador
    const savedInstanceString = localStorage.getItem("currentInstance");
    const instanceData = savedInstanceString ? JSON.parse(savedInstanceString) : {};

    // 2. Llamamos al backend con el perfil correcto y los datos reales
    generateExplanation(profile || "non-expert", instanceData).then((result) => {
      setExplanation(result.natural || "No se pudo generar una explicación natural.")
      setIsLoading(false)
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, [profile])

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setIsChatLoading(true)

    // TODO: Google RAG: send conversation + retrieved references (Drive/GCS) to /chat endpoint
    const response = await chatRag(message, messages)

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage, assistantMessage])
    setIsChatLoading(false)
  }

  const profileLabel = profile === "domain-expert" ? "Experto en el Dominio" : "Usuario general"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Respuesta adaptada para: {profileLabel}</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Explanation */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Explicación en lenguaje natural</CardTitle>
                  <Badge variant="secondary">RAG + Contexto</Badge>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <div className="whitespace-pre-line leading-relaxed">{explanation}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="p-6">
                <div className="flex flex-wrap gap-4">
                  <Button variant="outline" onClick={() => router.push("/profile")}>
                    Cambiar perfil
                  </Button>
                  <Button variant="outline" onClick={() => router.push("/instance")}>
                    Cambiar valores de la instancia
                  </Button>
                  <Button
                    className="ml-auto"
                    onClick={() => {
                      // TODO: Backend: close job, clean session, optionally persist logs/telemetry
                      router.push("/")
                    }}
                  >
                    Finalizar
                  </Button>
                </div>
              </Card>
            </div>

            {/* Chat Panel */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8 h-[600px]">
                <ChatPanel messages={messages} onSendMessage={handleSendMessage} isLoading={isChatLoading} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
