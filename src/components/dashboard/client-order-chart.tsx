
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
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { Users } from "lucide-react";

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function ClientOrderChart({ workOrders }: { workOrders: WorkOrder[] }) {
  const { data, chartConfig } = useMemo(() => {
    const clientDistribution: { [key: string]: number } = {};
    const activeOrders = workOrders.filter(
      (order) => order.status !== "Listo para Entrega" && order.status !== "Rechazado por Cliente"
    );

    activeOrders.forEach((order) => {
      const clientName = order.client;
      clientDistribution[clientName] = (clientDistribution[clientName] || 0) + 1;
    });

    const chartData = Object.entries(clientDistribution)
      .map(([name, value]) => ({
        client: name,
        orders: value,
      }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5); // Top 5 clients

    const config: ChartConfig = {
      orders: {
        label: "Órdenes Activas",
      },
    };
    chartData.forEach((item, index) => {
      config[item.client] = {
        label: item.client,
        color: chartColors[index % chartColors.length],
      };
    });

    return { data: chartData, chartConfig: config };
  }, [workOrders]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">Órdenes Activas por Cliente (Top 5)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              margin={{ left: 10, right: 10 }}
            >
              <YAxis
                dataKey="client"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                width={80}
                tickFormatter={(value) => value.slice(0, 10)}
              />
              <XAxis dataKey="orders" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="orders" layout="vertical" radius={5}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartConfig[entry.client]?.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex h-[250px] w-full items-center justify-center text-muted-foreground">
            No hay órdenes activas para mostrar.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
