"use client";

import { useMemo } from "react";
import type { WorkOrder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
];

export default function ComponentDistributionChart({ workOrders }: { workOrders: WorkOrder[] }) {
  const { data, chartConfig } = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    workOrders.forEach(order => {
      distribution[order.component] = (distribution[order.component] || 0) + 1;
    });

    const chartData = Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    })).sort((a,b) => b.value - a.value);

    const config: ChartConfig = {};
    chartData.forEach((item, index) => {
      config[item.name] = {
        label: item.name,
        color: chartColors[index % chartColors.length],
      };
    });

    return { data: chartData, chartConfig: config };
  }, [workOrders]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
         <PieChartIcon className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">Distribución de Componentes</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        ) : (
          <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
            No hay datos disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
}
