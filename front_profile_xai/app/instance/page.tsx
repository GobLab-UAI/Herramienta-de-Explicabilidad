"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Shuffle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { getDatasetSchema, getRandomInstance, type DatasetSchema, type InstanceData } from "@/lib/mock-api"
import { useToast } from "@/hooks/use-toast"

export default function InstancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [schema, setSchema] = useState<DatasetSchema | null>(null)
  const [instance, setInstance] = useState<InstanceData>({})

  useEffect(() => {
    getDatasetSchema().then((schema) => {
      setSchema(schema); 
    });
  }, []);

  const handleRandomInstance = async () => {
    const randomData = await getRandomInstance()
    setInstance(randomData)
    toast({ title: "Instancia aleatoria cargada" })
  }

  const handleSubmit = () => {
    // EL SECRETO ESTÁ AQUÍ: Guardamos los datos en el navegador antes de irnos
    localStorage.setItem("currentInstance", JSON.stringify(instance))
    router.push("/profile")
  }

  if (!schema) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Ingreso de datos de la instancia</h1>
            <p className="text-muted-foreground">Define los valores de la instancia para generar la explicación</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Valores de las variables</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {schema.columns.map((column, idx) => (
                <div key={idx} className="space-y-2">
                  <Label htmlFor={column.name}>{column.name}</Label>
                  {column.type === "categorical" && column.options ? (
                    <Select
                      value={instance[column.name]?.toString() || ""}
                      onValueChange={(value) => setInstance({ ...instance, [column.name]: value })}
                    >
                      <SelectTrigger id={column.name}>
                        <SelectValue placeholder={`Seleccionar ${column.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {column.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={column.name}
                      type={column.type === "numerical" ? "number" : "text"}
                      value={instance[column.name]?.toString() || ""}
                      onChange={(e) => {
                        // Aseguramos que los números viajen como Float/Int y no como Strings
                        const val = column.type === "numerical" ? Number(e.target.value) : e.target.value;
                        setInstance({ ...instance, [column.name]: val })
                      }}
                      placeholder={`Ingresar ${column.name}`}
                    />
                  )}
                </div>
              ))}

              <Button variant="outline" className="w-full bg-transparent" onClick={handleRandomInstance}>
                <Shuffle className="mr-2 h-4 w-4" />
                Elegir una instancia aleatoria del conjunto de datos
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/setup">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Link>
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              Seleccionar perfil
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
