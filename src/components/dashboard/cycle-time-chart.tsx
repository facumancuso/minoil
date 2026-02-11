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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Timer } from "lucide-react";

const getDate = (date: any): Date | undefined => {
  if (!date) return undefined;
  if (date.seconds) return new Date(date.seconds * 1000);
  if (typeof date === "string") return new Date(date);
  if (date instanceof Date) return date;
  return undefined;
};

const diffDays = (start?: Date, end?: Date): number | null => {
  if (!start || !end) return null;
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
};

type PhaseData = {
  label: string;
  key: string;
  avgDays: number;
  count: number;
};

const chartConfig = {
  avgDays: {
    label: "Promedio (días)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const phaseColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function CycleTimeChart({ workOrders }: { workOrders: WorkOrder[] }) {
  const phases = useMemo<PhaseData[]>(() => {
    const accumulators: Record<string, { total: number; count: number }> = {
      waiting: { total: 0, count: 0 },
      evaluation: { total: 0, count: 0 },
      spareParts: { total: 0, count: 0 },
      assembly: { total: 0, count: 0 },
      totalCycle: { total: 0, count: 0 },
    };

    workOrders.forEach((order) => {
      const createdAt = getDate(order.createdAt);
      const evalStart = getDate(order.evaluationStartDate);
      const evalEnd = getDate(order.evaluationEndDate);
      const quotationApproval = getDate(order.clientQuotationApprovalDate);
      const partsArrival = getDate(order.sparePartsArrivalDate);
      const assemblyStart = getDate(order.assemblyStartDate);
      const assemblyEnd = getDate(order.assemblyEndDate);
      const delivery = getDate(order.deliveryDate);

      const waitDays = diffDays(createdAt, evalStart);
      if (waitDays !== null) {
        accumulators.waiting.total += waitDays;
        accumulators.waiting.count++;
      }

      const evalDays = diffDays(evalStart, evalEnd);
      if (evalDays !== null) {
        accumulators.evaluation.total += evalDays;
        accumulators.evaluation.count++;
      }

      const partsDays = diffDays(quotationApproval, partsArrival);
      if (partsDays !== null) {
        accumulators.spareParts.total += partsDays;
        accumulators.spareParts.count++;
      }

      const assemblyDays = diffDays(assemblyStart, assemblyEnd);
      if (assemblyDays !== null) {
        accumulators.assembly.total += assemblyDays;
        accumulators.assembly.count++;
      }

      const endDate = delivery || assemblyEnd;
      const totalDays = diffDays(createdAt, endDate);
      if (totalDays !== null) {
        accumulators.totalCycle.total += totalDays;
        accumulators.totalCycle.count++;
      }
    });

    const labels: { key: string; label: string }[] = [
      { key: "waiting", label: "Espera de Desarme" },
      { key: "evaluation", label: "Desarme y Evaluación" },
      { key: "spareParts", label: "Espera de Repuestos" },
      { key: "assembly", label: "Armado" },
      { key: "totalCycle", label: "Ciclo Total" },
    ];

    return labels.map(({ key, label }) => ({
      label,
      key,
      avgDays: accumulators[key].count > 0
        ? Math.round((accumulators[key].total / accumulators[key].count) * 10) / 10
        : 0,
      count: accumulators[key].count,
    }));
  }, [workOrders]);

  const chartData = phases.map((p, i) => ({
    phase: p.label,
    avgDays: p.avgDays,
    fill: phaseColors[i % phaseColors.length],
  }));

  const hasData = phases.some((p) => p.count > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <Timer className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">
          Tiempo de Ciclo Promedio por Fase
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="space-y-6">
            <ChartContainer config={chartConfig} className="h-[220px] w-full">
              <BarChart
                accessibilityLayer
                data={chartData}
                layout="vertical"
                margin={{ left: 10, right: 30 }}
              >
                <CartesianGrid horizontal={false} />
                <YAxis
                  dataKey="phase"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={130}
                  tickFormatter={(v) => v}
                  className="text-xs"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}d`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Bar dataKey="avgDays" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-2 font-medium">Fase</th>
                    <th className="text-right py-2 font-medium">Promedio (días)</th>
                    <th className="text-right py-2 font-medium">OT con datos</th>
                  </tr>
                </thead>
                <tbody>
                  {phases.map((p) => (
                    <tr key={p.key} className="border-b last:border-0">
                      <td className="py-2 font-medium">{p.label}</td>
                      <td className="text-right py-2">{p.avgDays > 0 ? p.avgDays : "—"}</td>
                      <td className="text-right py-2 text-muted-foreground">{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex h-[250px] w-full items-center justify-center text-sm text-muted-foreground">
            No hay datos suficientes para calcular tiempos de ciclo.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
