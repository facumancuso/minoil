"use client";

import { useMemo } from "react";
import { subMonths, format, startOfMonth } from "date-fns";
import type { WorkOrder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

const chartConfig = {
  "Order Count": {
    label: "Cantidad de Órdenes",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function OrderTrendsChart({ workOrders }: { workOrders: WorkOrder[] }) {
  const data = useMemo(() => {
    const now = new Date();
    const trendData: { [key: string]: number } = {};

    for (let i = 5; i >= 0; i--) {
      const monthKey = format(subMonths(now, i), "MMM");
      trendData[monthKey] = 0;
    }

    const sixMonthsAgo = startOfMonth(subMonths(now, 5));

    workOrders.forEach(order => {
      if (order.createdAt >= sixMonthsAgo) {
        const monthKey = format(order.createdAt, "MMM");
        if (monthKey in trendData) {
          trendData[monthKey]++;
        }
      }
    });

    return Object.entries(trendData).map(([month, count]) => ({
      month,
      "Order Count": count,
    }));
  }, [workOrders]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">Tendencias de Órdenes (Últimos 6 meses)</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis allowDecimals={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="Order Count"
              type="monotone"
              stroke="var(--color-Order Count)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
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
