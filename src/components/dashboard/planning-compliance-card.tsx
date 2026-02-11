"use client";

import { useMemo } from "react";
import type { WorkOrder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";

const getDate = (date: any): Date | undefined => {
  if (!date) return undefined;
  if (date.seconds) return new Date(date.seconds * 1000);
  if (typeof date === "string") return new Date(date);
  if (date instanceof Date) return date;
  return undefined;
};

export default function PlanningComplianceCard({ workOrders }: { workOrders: WorkOrder[] }) {
  const { compliancePercent, avgDelta, onTimeCount, totalWithDates } = useMemo(() => {
    let onTime = 0;
    let total = 0;
    let deltaSum = 0;

    workOrders.forEach((order) => {
      const estimated = getDate(order.estimatedDeliveryDate);
      const actual = getDate(order.deliveryDate);

      if (!estimated || !actual) return;

      total++;
      const diffMs = actual.getTime() - estimated.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      deltaSum += diffDays;

      if (diffDays <= 0) {
        onTime++;
      }
    });

    return {
      compliancePercent: total > 0 ? Math.round((onTime / total) * 100) : null,
      avgDelta: total > 0 ? Math.round((deltaSum / total) * 10) / 10 : null,
      onTimeCount: onTime,
      totalWithDates: total,
    };
  }, [workOrders]);

  const complianceColor =
    compliancePercent === null
      ? "text-muted-foreground"
      : compliancePercent >= 80
        ? "text-green-600 dark:text-green-400"
        : compliancePercent >= 50
          ? "text-yellow-600 dark:text-yellow-400"
          : "text-red-600 dark:text-red-400";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Cumplimiento de Planificación</CardTitle>
        <CalendarCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {compliancePercent !== null ? (
          <>
            <div className={`text-2xl font-bold ${complianceColor}`}>
              {compliancePercent}%
            </div>
            <p className="text-xs text-muted-foreground">
              {onTimeCount} de {totalWithDates} entregados a tiempo
            </p>
            {avgDelta !== null && (
              <p className="text-xs text-muted-foreground mt-1">
                Desvío promedio: {avgDelta > 0 ? "+" : ""}{avgDelta} días
              </p>
            )}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold text-muted-foreground">—</div>
            <p className="text-xs text-muted-foreground">
              Sin datos de entregas con fecha estimada
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
