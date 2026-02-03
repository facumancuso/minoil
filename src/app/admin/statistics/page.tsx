
'use client';

import type { WorkOrder } from '@/lib/types';
import KpiCard from '@/components/dashboard/kpi-card';
import ComponentDistributionChart from '@/components/dashboard/component-distribution-chart';
import OrderTrendsChart from '@/components/dashboard/order-trends-chart';
import ServiceInsights from '@/components/dashboard/service-insights';
import TestBenchStatus from '@/components/dashboard/test-bench-status';
import { Wrench, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import ClientOrderChart from '@/components/dashboard/client-order-chart';
import { useCollection } from '@/hooks/use-collection';

export default function AdminStatisticsPage() {
  const { data: workOrders, isLoading } = useCollection<WorkOrder>('/api/work-orders');

  const kpiData = {
    inProcess: (workOrders || []).filter(o => o.status !== 'Listo para Entregar' && o.status !== 'Rechazado por Cliente').length,
    completed: (workOrders || []).filter(o => o.status === 'Listo para Entregar').length,
    pending: (workOrders || []).filter(o => o.status === 'Espera de Desarme y Evaluación' || o.status === 'Cotizacion al cliente' || o.status === 'Espera de repuesto' || o.status === 'Llegada de Repuesto').length,
    rejected: (workOrders || []).filter(o => o.status === 'Rechazado por Cliente').length,
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Estadísticas Generales
        </h1>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8 lg:grid-cols-3 xl:grid-cols-5">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:col-span-3 xl:col-span-5">
          <KpiCard title="En Proceso" value={kpiData.inProcess.toString()} icon={Wrench} description="Órdenes de trabajo actualmente activas" />
          <KpiCard title="Listas para Entrega" value={kpiData.completed.toString()} icon={CheckCircle2} description="Órdenes de trabajo terminadas este mes" />
          <KpiCard title="En Espera" value={kpiData.pending.toString()} icon={Clock} description="Órdenes esperando acción" />
          <KpiCard title="Rechazadas" value={kpiData.rejected.toString()} icon={AlertTriangle} description="Órdenes de trabajo rechazadas por cliente" />
        </div>
        <div className="grid gap-4 lg:gap-8 lg:grid-cols-2 xl:grid-cols-3 lg:col-span-3 xl:col-span-5">
          <ComponentDistributionChart workOrders={workOrders || []} />
          <OrderTrendsChart workOrders={workOrders || []} />
          <ClientOrderChart workOrders={workOrders || []} />
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8 lg:col-span-3 xl:col-span-5">
          <ServiceInsights workOrders={workOrders || []} />
          <TestBenchStatus />
        </div>
      </div>
    </>
  );
}
