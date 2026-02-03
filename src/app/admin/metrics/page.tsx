
'use client';

import type { WorkOrder } from '@/lib/types';
import { useState } from 'react';
import KpiCard from '@/components/dashboard/kpi-card';
import ComponentDistributionChart from '@/components/dashboard/component-distribution-chart';
import OrderTrendsChart from '@/components/dashboard/order-trends-chart';
import ServiceInsights from '@/components/dashboard/service-insights';
import TestBenchStatus from '@/components/dashboard/test-bench-status';
import { Wrench, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { AddOrderDialog } from '@/components/work-order/add-order-dialog';
import { addWorkOrderAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useCollection } from '@/hooks/use-collection';

export default function AdminMetricsPage() {
  const { data: workOrders, isLoading } = useCollection<WorkOrder>('/api/work-orders');
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const { toast } = useToast();

  const kpiData = {
    inProcess: (workOrders || []).filter(o => o.status !== 'Listo para Entrega' && o.status !== 'Rechazado por Cliente').length,
    completed: (workOrders || []).filter(o => o.status === 'Listo para Entrega').length,
    pending: (workOrders || []).filter(o => o.status === 'Llegada de componente' || o.status === 'Esperando Aprobación Cliente').length,
    rejected: (workOrders || []).filter(o => o.status === 'Rechazado por Cliente').length,
  };
  
   const handleAddOrder = async (data: { client: any; equipment: any; component: any; }) => {
    try {
      await addWorkOrderAction(data);
      setIsAddOrderOpen(false);
      toast({
        title: "Orden Agregada",
        description: `La orden de trabajo ha sido creada exitosamente.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar la orden de trabajo.",
      });
    }
  };


  return (
    <>
    <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
            Métricas Generales
        </h1>
        <Button size="sm" className="gap-1" onClick={() => setIsAddOrderOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Nueva Orden
        </Button>
    </div>
    <div className="grid auto-rows-max items-start gap-4 lg:gap-8 lg:grid-cols-3 xl:grid-cols-5">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:col-span-3 xl:col-span-5">
            <KpiCard title="En Proceso" value={kpiData.inProcess.toString()} icon={Wrench} description="Órdenes de trabajo actualmente activas" />
            <KpiCard title="Listas para Entrega" value={kpiData.completed.toString()} icon={CheckCircle2} description="Órdenes de trabajo terminadas este mes" />
            <KpiCard title="En Espera" value={kpiData.pending.toString()} icon={Clock} description="Órdenes esperando acción" />
            <KpiCard title="Rechazadas" value={kpiData.rejected.toString()} icon={AlertTriangle} description="Órdenes de trabajo rechazadas por cliente" />
        </div>
        <div className="grid gap-4 lg:gap-8 lg:grid-cols-2 xl:grid-cols-2 lg:col-span-3 xl:col-span-3">
          <ComponentDistributionChart workOrders={workOrders || []} />
          <OrderTrendsChart workOrders={workOrders || []} />
        </div>
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8 lg:col-span-3 xl:col-span-2">
            <ServiceInsights workOrders={workOrders || []} />
            <TestBenchStatus />
        </div>
    </div>
    <AddOrderDialog isOpen={isAddOrderOpen} onOpenChange={setIsAddOrderOpen} onAddOrder={handleAddOrder} />
    </>
  );
}
