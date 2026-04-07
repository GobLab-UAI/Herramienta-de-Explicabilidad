import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Users, MessageSquare, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-balance">Herramienta de Explicabilidad</h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
            Explicaciones adaptativas a perfiles para modelos de IA. Genere información interpretable y adaptada a su audiencia con una base de conocimiento y un chat.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="text-base">
              <Link href="/auth">
                Iniciar Análisis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Interpretabilidad del Modelo</CardTitle>
              <CardDescription className="leading-relaxed">
              Genere explicaciones completas utilizando Metodos de Interpretabildiad Agnosticos para cualquier modelo de caja negra              
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Perfil adaptativo</CardTitle>
              <CardDescription className="leading-relaxed">
                Explicaciones personalizadas para especialistas en IA, expertos en el dominio o usuario general con un lenguaje adaptable.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-10 w-10 mb-4 text-primary" />
              <CardTitle>Chat con Contexto</CardTitle>
              <CardDescription className="leading-relaxed">
               Haga preguntas sobre explicaciones con contexto desde su base de conocimiento           
               </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  )
}
