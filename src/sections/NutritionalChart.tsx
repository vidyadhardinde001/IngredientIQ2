"use client";

import React, { useState } from "react";
import { Pie, Bar, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";

// Register all required components
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  RadialLinearScale, // Required for PolarArea chart
  ChartTooltip,
  Legend
);

type ChartType = "pie" | "donut" | "bar" | "polar";

interface NutritionalChartProps {
  labels: string[];
  values: number[];
  label: string;
}

const NutritionalChart: React.FC<NutritionalChartProps> = ({
  labels,
  values,
  label,
}) => {
  const [chartType, setChartType] = useState<ChartType>("donut");
  const [isLoading, setIsLoading] = useState(true);

  // Filter out zero values to keep the chart clean
  const filteredData = labels.map((label, index) => ({
    label,
    value: values[index] || 0,
  })).filter(item => item.value > 0);

  const colorPalette = [
    "rgba(54, 162, 235, 0.7)",  // Blue
    "rgba(255, 99, 132, 0.7)",   // Red
    "rgba(255, 206, 86, 0.7)",   // Yellow
    "rgba(75, 192, 192, 0.7)",   // Teal
    "rgba(153, 102, 255, 0.7)",  // Purple
    "rgba(255, 159, 64, 0.7)",   // Orange
    "rgba(199, 199, 199, 0.7)",  // Gray
  ];

  const borderColorPalette = [
    "rgba(54, 162, 235, 1)",
    "rgba(255, 99, 132, 1)",
    "rgba(255, 206, 86, 1)",
    "rgba(75, 192, 192, 1)",
    "rgba(153, 102, 255, 1)",
    "rgba(255, 159, 64, 1)",
    "rgba(199, 199, 199, 1)",
  ];

  const chartData = {
    labels: filteredData.map(item => item.label),
    datasets: [
      {
        data: filteredData.map(item => item.value),
        backgroundColor: colorPalette,
        borderColor: borderColorPalette,
        borderWidth: 1,
        hoverOffset: 15,
        borderRadius: chartType === "bar" ? 4 : 0,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      onComplete: () => {
        setIsLoading(false);
      }
    },
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          font: {
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value}g (${percentage}%)`;
          },
        },
        bodyFont: {
          size: 12,
        },
        titleFont: {
          size: 14,
          weight: "bold",
        },
        padding: 12,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
      },
      title: {
        display: true,
        text: label,
        font: {
          size: 16,
          weight: "600",
        },
        padding: {
          top: 10,
          bottom: 20,
        },
      },
    },
  };

  const chartSpecificOptions = {
    pie: {
      ...commonOptions,
      cutout: "0%",
    },
    donut: {
      ...commonOptions,
      cutout: "60%",
    },
    bar: {
      ...commonOptions,
      indexAxis: "y" as const,
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            display: false,
          },
        },
        y: {
          grid: {
            display: false,
          },
        },
      },
    },
    polar: {
      ...commonOptions,
      scales: {
        r: {
          ticks: {
            display: false,
            backdropColor: 'transparent'
          },
          grid: {
            circular: true
          }
        }
      }
    },
  };

  const renderChart = () => {
    switch (chartType) {
      case "pie":
        return <Pie data={chartData} options={chartSpecificOptions.pie} />;
      case "donut":
        return <Pie data={chartData} options={chartSpecificOptions.donut} />;
      case "bar":
        return <Bar data={chartData} options={chartSpecificOptions.bar} />;
      case "polar":
        return <PolarArea data={chartData} options={chartSpecificOptions.polar} />;
      default:
        return <Pie data={chartData} options={chartSpecificOptions.donut} />;
    }
  };

  const handleChartChange = (type: ChartType) => {
    setIsLoading(true);
    setChartType(type);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleChartChange("donut")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              chartType === "donut"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Donut
          </button>
          <button
            onClick={() => handleChartChange("pie")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              chartType === "pie"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Pie
          </button>
          <button
            onClick={() => handleChartChange("bar")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              chartType === "bar"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => handleChartChange("polar")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              chartType === "polar"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Polar
          </button>
        </div>
      </div>

      <div className="relative h-64 md:h-80 lg:h-96">
        {filteredData.length > 0 ? (
          <>
            {renderChart()}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
                <div className="p-2 rounded-lg shadow-sm">
                  <span className="text-sm font-medium text-gray-700">
                    Loading chart...
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No nutritional data available
          </div>
        )}
      </div>

      {filteredData.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {filteredData.map((item, index) => (
            <div
              key={index}
              className="p-2 rounded-md hover:bg-gray-50 transition-colors"
              style={{ borderLeft: `4px solid ${borderColorPalette[index]}` }}
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: colorPalette[index] }}
                />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {item.label}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {item.value}g
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NutritionalChart;