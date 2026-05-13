"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tags } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { setLabels } from "@/lib/mock-api"
import { useToast } from "@/hooks/use-toast"

export default function LabelsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [classes, setClasses] = useState<string[]>([])
  const [labelMap, setLabelMap] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem("classes_detected")
    if (!raw) {
      router.push("/setup")
      return
    }
    try {
      const detected: string[] = JSON.parse(raw)
      setClasses(detected)
      setLabelMap(Object.fromEntries(detected.map(c => [c, ""])))
    } catch {
      router.push("/setup")
    }
  }, [])

  const allFilled = classes.length > 0 && classes.every(c => labelMap[c]?.trim())

  const handleSkip = async () => {
    setIsSaving(true)
    try {
      const fallback = Object.fromEntries(classes.map(c => [c, c]))
      await setLabels(fallback)
      router.push("/instance")
    } catch {
      toast({ title: "Error", description: "No se pudo guardar las etiquetas.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleContinue = async () => {
    setIsSaving(true)
    try {
      await setLabels(labelMap)
      router.push("/instance")
    } catch {
      toast({ title: "Error", description: "No se pudo guardar las etiquetas.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (classes.length === 0) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Nombra las clases del modelo</h1>
            <p className="text-muted-foreground">
              El modelo tiene <strong>{classes.length} clases</strong>. Puedes asignar un nombre
              legible a cada una o continuar con los valores originales.
            </p>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Tags className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Clases detectadas</CardTitle>
              </div>
              <CardDescription>
                Escribe un nombre para cada clase (ej: "No Diabetes", "Diabetes").
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {classes.map((cls) => (
                  <div key={cls} className="space-y-1.5">
                    <Label htmlFor={`class-${cls}`} className="text-sm font-medium">
                      Clase <code className="bg-muted px-1 rounded text-xs">{cls}</code>
                    </Label>
                    <Input
                      id={`class-${cls}`}
                      placeholder={`Nombre para la clase ${cls}`}
                      value={labelMap[cls] ?? ""}
                      onChange={(e) =>
                        setLabelMap(prev => ({ ...prev, [cls]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              disabled={isSaving}
              onClick={handleSkip}
            >
              Omitir
            </Button>
            <Button
              className="flex-1"
              disabled={!allFilled || isSaving}
              onClick={handleContinue}
            >
              Continuar
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
