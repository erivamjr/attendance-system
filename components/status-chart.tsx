"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface StatusChartProps {
  data: number[]
}

export function StatusChart({ data = [0, 0, 0] }: StatusChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir o gráfico anterior se existir
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Criar novo gráfico
    chartInstance.current = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Enviadas", "Aguardando Assinatura", "Pendentes"],
        datasets: [
          {
            data,
            backgroundColor: ["rgba(34, 197, 94, 0.7)", "rgba(234, 179, 8, 0.7)", "rgba(239, 68, 68, 0.7)"],
            borderColor: ["rgba(34, 197, 94, 1)", "rgba(234, 179, 8, 1)", "rgba(239, 68, 68, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })

    // Limpar ao desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return (
    <div className="h-[300px]">
      <canvas ref={chartRef} />
    </div>
  )
}
