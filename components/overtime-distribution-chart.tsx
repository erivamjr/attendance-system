"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function OvertimeDistributionChart() {
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
      type: "pie",
      data: {
        labels: ["Hora Extra 50%", "Hora Extra 100%", "Adicional Noturno", "Sobreaviso"],
        datasets: [
          {
            data: [45, 25, 20, 10],
            backgroundColor: [
              "rgba(59, 130, 246, 0.7)",
              "rgba(239, 68, 68, 0.7)",
              "rgba(168, 85, 247, 0.7)",
              "rgba(234, 179, 8, 0.7)",
            ],
            borderColor: [
              "rgba(59, 130, 246, 1)",
              "rgba(239, 68, 68, 1)",
              "rgba(168, 85, 247, 1)",
              "rgba(234, 179, 8, 1)",
            ],
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
  }, [])

  return (
    <div className="h-full w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
