
'use client';

import { useCollection } from '@/hooks/use-collection';
import { InteractiveGanttChart } from '@/components/gantt/gantt-chart';
import type { WorkOrder } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminGanttPage() {
  const { data: workOrders, isLoading } = useCollection<WorkOrder>('/api/work-orders');

  return (
    <div className="container mx-auto p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-headline text-2xl lg:text-3xl font-bold tracking-tight">
            Diagrama de Gantt - Órdenes de Trabajo
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visualización de la línea de tiempo de las órdenes de trabajo.
          </p>
        </div>
      </div>
      {isLoading ? (
        <Skeleton className="h-[600px] w-full" />
      ) : (
        <InteractiveGanttChart workOrders={workOrders || []} />
      )}
    </div>
  );
}
