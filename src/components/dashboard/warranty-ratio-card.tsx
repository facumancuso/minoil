"use client";

import { useMemo } from "react";
import type { WorkOrder } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

const getDate = (date: any): Date | undefined => {
  if (!date) return undefined;
  if (date.seconds) return new Date(date.seconds * 1000);
  if (typeof date === "string") return new Date(date);
  if (date instanceof Date) return date;
  return undefined;
};

export default function WarrantyRatioCard({ workOrders }: { workOrders: WorkOrder[] }) {
  const { warrantyClaims, deliveredCount, ratio } = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const thisYearOrders = workOrders.filter((o) => {
      const created = getDate(o.createdAt);
      return created && created.getFullYear() === currentYear;
    });

    const claims = thisYearOrders.filter(
      (o) => o.workOrderType === "Garantía"
    ).length;

    const delivered = thisYearOrders.filter(
      (o) => o.status === "Listo para Entregar" || o.status === "Entregado"
    ).length;

    return {
      warrantyClaims: claims,
      deliveredCount: delivered,
      ratio: delivered > 0 ? Math.round((claims / delivered) * 1000) / 10 : null,
    };
  }, [workOrders]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Garantías vs Entregas ({new Date().getFullYear()})</CardTitle>
        <ShieldAlert className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {warrantyClaims} / {deliveredCount}
        </div>
        <p className="text-xs text-muted-foreground">
          {warrantyClaims} reclamos en garantía — {deliveredCount} componentes entregados
        </p>
        {ratio !== null && (
          <p className="text-xs text-muted-foreground mt-1">
            Tasa de reclamo: {ratio}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}
