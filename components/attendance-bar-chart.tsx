"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

export function AttendanceBarChart() {
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
      type: "bar",
      data: {
        labels: ["UBS Vila Nova", "UBS Central", "UBS Jardim", "UPA 24h", "Hospital Municipal"],
        datasets: [
          {
            label: "Presença (%)",
            data: [95, 92, 97, 90, 88],
            backgroundColor: "rgba(34, 197, 94, 0.7)",
            borderColor: "rgba(34, 197, 94, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => value + "%",
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
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
