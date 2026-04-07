"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { FileUploadCard } from "@/components/file-upload-card"
import { uploadKnowledgeBase, uploadModel, uploadDataset, startProcessing } from "@/lib/mock-api"
import { useToast } from "@/hooks/use-toast"

export default function SetupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([])
  const [modelFiles, setModelFiles] = useState<File[]>([])
  const [datasetFiles, setDatasetFiles] = useState<File[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  const readyCount = [knowledgeFiles.length > 0, modelFiles.length > 0, datasetFiles.length > 0].filter(Boolean).length
  const progress = (readyCount / 3) * 100
  const isReady = readyCount === 3

  const handleProcess = async () => {
    setIsProcessing(true);

    try {
      console.log("1. Solicitando Job ID al backend...");
      const job = await startProcessing();
      
      console.log("2. Job ID recibido:", job.jobId, " - Subiendo archivos...");
      await uploadKnowledgeBase(knowledgeFiles);
      await uploadModel(modelFiles);
      await uploadDataset(datasetFiles);
      
      console.log("3. Archivos subidos con éxito. Redirigiendo a /instance...");
      router.push("/instance");
      
    } catch (error) {
      console.error("Error durante el proceso:", error);
      toast({
        title: "Error",
        description: "Hubo un problema de conexión con el servidor.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Configuración del entorno de explicación</h1>
            <p className="text-muted-foreground">
              Sube tu base de conocimientos multimodal, archivos del modelo y conjunto de datos de referencia
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-6">
            <FileUploadCard
              title="1. Base de conocimientos multimodal"
              description="Sube documentación, imágenes y materiales de referencia"
              acceptedTypes=".pdf,.docx,.jpg,.jpeg,.png,.txt"
              files={knowledgeFiles}
              onFilesChange={setKnowledgeFiles}
            />

            <FileUploadCard
              title="2. Modelo de caja negra y preprocesamiento"
              description="Sube tu modelo entrenado y el pipeline de preprocesamiento"
              acceptedTypes=".pkl,.h5"
              files={modelFiles}
              onFilesChange={setModelFiles}
            />

            <FileUploadCard
              title="3. Conjunto de datos de referencia"
              description="Sube el conjunto de datos utilizado para el entrenamiento del modelo o referencia"
              acceptedTypes=".xlsx,.csv"
              files={datasetFiles}
              onFilesChange={setDatasetFiles}
            />
          </div>

          <Card className="p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progreso de la configuración</span>
                <span className="text-muted-foreground">{readyCount}/3 listos</span>
              </div>
              <Progress value={progress} />
            </div>

            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <Link href="/auth">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Atrás
                </Link>
              </Button>
              <Button className="flex-1" disabled={!isReady || isProcessing} onClick={handleProcess}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? "Procesando..." : "Procesar"}
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
