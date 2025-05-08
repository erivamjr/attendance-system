"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { getSupabase } from "@/lib/supabase"
import { jsPDF } from "jspdf"
import "jspdf-autotable"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Adicione esta linha para resolver o erro de tipos do jsPDF-autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export function AttendancePreview() {
  const [loading, setLoading] = useState(true)
  const [units, setUnits] = useState<any[]>([])
  const [selectedUnit, setSelectedUnit] = useState<string>("")
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth().toString())
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString())
  const [employees, setEmployees] = useState<any[]>([])
  const [frequencyData, setFrequencyData] = useState<any[]>([])
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [organizationName, setOrganizationName] = useState<string>("")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const { toast } = useToast()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Gerar array de meses
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i.toString(),
    label: format(new Date(2021, i, 1), "MMMM", { locale: ptBR }),
  }))

  // Gerar array de anos (5 anos para trás e 1 para frente)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 6 }, (_, i) => ({
    value: (currentYear - 5 + i).toString(),
    label: (currentYear - 5 + i).toString(),
  }))

  // Buscar unidades
  useEffect(() => {
    async function fetchUnits() {
      try {
        const supabase = getSupabase()

        // Buscar organização para obter o nome e logo
        const { data: orgData } = await supabase.from("organizations").select("name, logo_url").single()

        if (orgData) {
          setOrganizationName(orgData.name)
          setLogoUrl(orgData.logo_url)
        }

        // Buscar unidades
        const { data, error } = await supabase.from("units").select("id, name").order("name")

        if (error) throw error

        if (data) {
          setUnits(data)
          // Se o usuário for responsável por uma unidade, selecionar automaticamente
          // Por enquanto, vamos apenas selecionar a primeira unidade se existir
          if (data.length > 0 && !selectedUnit) {
            setSelectedUnit(data[0].id)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar unidades:", error)
        toast({
          title: "Erro ao carregar unidades",
          description: "Não foi possível carregar as unidades. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUnits()
  }, [toast])

  // Buscar dados da folha de frequência quando unidade, mês ou ano mudar
  useEffect(() => {
    async function fetchFrequencyData() {
      if (!selectedUnit || !selectedMonth || !selectedYear) return

      setGenerating(true)
      try {
        const supabase = getSupabase()

        // Buscar funcionários da unidade
        const { data: employeesData, error: employeesError } = await supabase
          .from("employees")
          .select("id, name, role, contract_type")
          .eq("unit_id", selectedUnit)
          .order("name")

        if (employeesError) throw employeesError

        if (employeesData) {
          setEmployees(employeesData)
        }

        // Buscar folha de frequência
        const { data: sheetData, error: sheetError } = await supabase
          .from("frequency_sheets")
          .select("id")
          .eq("unit_id", selectedUnit)
          .eq("month", Number.parseInt(selectedMonth))
          .eq("year", Number.parseInt(selectedYear))
          .single()

        if (sheetError && sheetError.code !== "PGRST116") {
          throw sheetError
        }

        if (sheetData) {
          // Buscar entradas de frequência
          const { data: entriesData, error: entriesError } = await supabase
            .from("frequency_entries")
            .select(`
              id, 
              employee_id, 
              absence_days, 
              additional_night_hours, 
              overtime_50_hours, 
              overtime_100_hours, 
              on_call_hours, 
              vacation_days,
              justification
            `)
            .eq("sheet_id", sheetData.id)

          if (entriesError) throw entriesError

          if (entriesData) {
            setFrequencyData(entriesData)
            // Gerar PDF
            generatePDF(employeesData, entriesData)
          }
        } else {
          // Não há folha para este mês/ano
          setFrequencyData([])
          toast({
            title: "Folha não encontrada",
            description: "Não há folha de frequência para o período selecionado.",
            variant: "destructive",
          })
          setPdfUrl(null)
        }
      } catch (error) {
        console.error("Erro ao buscar dados de frequência:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados da folha de frequência.",
          variant: "destructive",
        })
        setPdfUrl(null)
      } finally {
        setGenerating(false)
      }
    }

    fetchFrequencyData()
  }, [selectedUnit, selectedMonth, selectedYear, toast])

  // Função para gerar o PDF
  const generatePDF = async (employees: any[], frequencyEntries: any[]) => {
    try {
      // Criar novo documento PDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      })

      // Adicionar logo se existir
      if (logoUrl) {
        try {
          const supabase = getSupabase()
          const { data } = supabase.storage.from("logos").getPublicUrl(logoUrl.split("/").pop() || "")

          if (data?.publicUrl) {
            // Carregar a imagem
            const img = new Image()
            img.crossOrigin = "anonymous"
            img.src = data.publicUrl

            await new Promise((resolve, reject) => {
              img.onload = resolve
              img.onerror = reject
            })

            // Calcular dimensões para manter proporção e centralizar
            const maxWidth = 50
            const maxHeight = 30
            let imgWidth = img.width
            let imgHeight = img.height

            if (imgWidth > maxWidth) {
              const ratio = maxWidth / imgWidth
              imgWidth = maxWidth
              imgHeight = imgHeight * ratio
            }

            if (imgHeight > maxHeight) {
              const ratio = maxHeight / imgHeight
              imgHeight = maxHeight
              imgWidth = imgWidth * ratio
            }

            // Centralizar logo
            const pageWidth = doc.internal.pageSize.getWidth()
            const x = (pageWidth - imgWidth) / 2

            doc.addImage(img, "PNG", x, 10, imgWidth, imgHeight)
          }
        } catch (error) {
          console.error("Erro ao carregar logo:", error)
        }
      }

      // Adicionar cabeçalho
      const unitName = units.find((u) => u.id === selectedUnit)?.name || ""
      const monthName = months.find((m) => m.value === selectedMonth)?.label || ""
      const yearName = selectedYear

      // doc.setFontSize(16)
      // doc.text(organizationName, doc.internal.pageSize.getWidth() / 2, logoUrl ? 50 : 20, { align: "center" })

      doc.setFontSize(14)
      doc.text(
        `FOLHA DE FREQUÊNCIA - ${unitName.toUpperCase()}`,
        doc.internal.pageSize.getWidth() / 2,
        logoUrl ? 40 : 30,
        { align: "center" },
      )

      doc.setFontSize(12)
      doc.text(`${monthName.toUpperCase()} / ${yearName}`, doc.internal.pageSize.getWidth() / 2, logoUrl ? 50 : 40, {
        align: "center",
      })

      // Preparar dados para a tabela
      const tableData = employees.map((employee) => {
        const entry = frequencyEntries.find((e) => e.employee_id === employee.id)

        return [
          employee.name,
          employee.role,
          employee.contract_type,
          entry ? entry.absence_days : 0,
          entry ? entry.additional_night_hours : 0,
          entry ? entry.overtime_50_hours : 0,
          entry ? entry.overtime_100_hours : 0,
          entry ? entry.on_call_hours : 0,
          entry ? entry.vacation_days : 0,
          entry ? entry.justification || "" : "",
        ]
      })

      // Adicionar tabela
      doc.autoTable({
        startY: logoUrl ? 60 : 50,
        head: [
          [
            "Nome",
            "Cargo",
            "Vínculo",
            "Faltas",
            "Ad. Not.",
            "HE 50%",
            "HE 100%",
            "Sobreaviso",
            "Férias",
            "Justificativa",
          ],
        ],
        body: tableData,
        theme: "grid",
        headStyles: { fillColor: [70, 70, 70], textColor: [255, 255, 255] },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 50 },
          9: { cellWidth: 50 },
        },
      })

      // Adicionar rodapé com espaço para assinatura
      const finalY = (doc as any).lastAutoTable.finalY || 200

      doc.setFontSize(10)
      doc.text("Assinatura do Coordenador:", 20, finalY + 30)
      doc.line(20, finalY + 40, 120, finalY + 40)

      doc.text("Data:", 150, finalY + 30)
      doc.line(150, finalY + 40, 200, finalY + 40)

      // Converter para URL de dados
      const pdfBlob = doc.output("blob")
      const pdfUrl = URL.createObjectURL(pdfBlob)
      setPdfUrl(pdfUrl)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o PDF. Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  // Função para baixar o PDF
  const handleDownloadPDF = () => {
    if (!pdfUrl) {
      toast({
        title: "PDF não disponível",
        description: "Gere o PDF primeiro selecionando uma unidade, mês e ano.",
        variant: "destructive",
      })
      return
    }

    const unitName = units.find((u) => u.id === selectedUnit)?.name || "unidade"
    const monthName = months.find((m) => m.value === selectedMonth)?.label || "mes"
    const yearName = selectedYear

    // Criar link para download
    const link = document.createElement("a")
    link.href = pdfUrl
    link.download = `folha-frequencia-${unitName.toLowerCase().replace(/\s+/g, "-")}-${monthName}-${yearName}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Função para imprimir o PDF
  const handlePrintPDF = () => {
    if (!pdfUrl) {
      toast({
        title: "PDF não disponível",
        description: "Gere o PDF primeiro selecionando uma unidade, mês e ano.",
        variant: "destructive",
      })
      return
    }

    // Abrir em nova janela para impressão
    const printWindow = window.open(pdfUrl, "_blank")

    if (!printWindow) {
      toast({
        title: "Bloqueador de pop-up ativo",
        description: "Desative o bloqueador de pop-ups e tente novamente.",
        variant: "destructive",
      })
      return
    }

    // Imprimir após carregar
    printWindow.addEventListener("load", () => {
      printWindow.print()
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Unidade</label>
          {loading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Mês</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ano</label>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year.value} value={year.value}>
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {generating ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Skeleton className="h-[400px] w-full" />
              <p className="mt-4">Gerando visualização...</p>
            </div>
          ) : pdfUrl ? (
            <div className="flex flex-col">
              <div className="border rounded-md overflow-hidden" style={{ height: "500px" }}>
                <iframe
                  ref={iframeRef}
                  src={pdfUrl}
                  className="w-full h-full"
                  title="Visualização da folha de frequência"
                />
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <Button onClick={handleDownloadPDF} variant="outline">
                  Baixar PDF
                </Button>
                <Button onClick={handlePrintPDF} variant="outline">
                  Imprimir
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="mb-4">Selecione uma unidade, mês e ano para visualizar a folha de frequência</p>
              {!selectedUnit && <p className="text-sm text-muted-foreground">Nenhuma unidade selecionada</p>}
              {selectedUnit && (
                <p className="text-sm text-muted-foreground">Nenhuma folha encontrada para o período selecionado</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
