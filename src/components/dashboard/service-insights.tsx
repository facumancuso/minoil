"use client";

import { useMemo } from 'react';
import type { WorkOrder, ServiceInsight } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { List } from 'lucide-react';




// Helper to safely parse dates from Firestore Timestamp or other formats
const getDate = (date: any): Date | undefined => {
  if (!date) return undefined;
  if (date.seconds) return new Date(date.seconds * 1000);
  if (typeof date === 'string') return new Date(date);
  if (date instanceof Date) return date;
  return undefined;
}

export default function ServiceInsights({ workOrders }: { workOrders: WorkOrder[] }) {
  const insights = useMemo<ServiceInsight[]>(() => {
    const serviceCounts: { [key: string]: { count: number; totalDays: number } } = {};

    workOrders.forEach(order => {
      // Only consider orders that constitute valid data for analysis (e.g., have a creation date)
      const startDate = getDate(order.createdAt);
      if (!startDate) return;

      // Determine end date: Delivery > Assembly End > Now (if active)
      let endDate = new Date();

      const deliveryDate = getDate(order.deliveryDate);
      const assemblyEndDate = getDate(order.assemblyEndDate);

      if (deliveryDate) {
        endDate = deliveryDate;
      } else if (assemblyEndDate) {
        endDate = assemblyEndDate;
      }

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (!serviceCounts[order.component]) {
        serviceCounts[order.component] = { count: 0, totalDays: 0 };
      }
      serviceCounts[order.component].count++;
      serviceCounts[order.component].totalDays += diffDays;
    });

    return Object.entries(serviceCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgTime: `${(data.totalDays / data.count).toFixed(1)} días`,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [workOrders]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
        <List className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">Análisis de Servicio</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length > 0 ? (
          <ul className="space-y-2">
            {insights.map(insight => (
              <li key={insight.name} className="flex justify-between items-center text-sm">
                <span className="font-medium">{insight.name}</span>
                <div className="text-right">
                  <p className="text-foreground">{insight.count} órdenes</p>
                  <p className="text-xs text-muted-foreground">{insight.avgTime} prom.</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex h-full min-h-32 w-full items-center justify-center text-sm text-muted-foreground">
            No hay suficientes datos para análisis.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
