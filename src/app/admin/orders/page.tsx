
'use client';

import type { WorkOrder } from '@/lib/types';
import RecentOrdersTable from '@/components/dashboard/recent-orders-table';
import { useCollection } from '@/hooks/use-collection';


export default function AdminOrdersPage() {
  const { data: workOrders, isLoading } = useCollection<WorkOrder>('/api/work-orders');
  
  const updateWorkOrders = (updatedOrder: WorkOrder) => {
    // No-op, real-time updates are handled by useCollection
  };

  return (
    <>
       <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
            Listado de Órdenes
        </h1>
      </div>
      <RecentOrdersTable workOrders={workOrders || []} onUpdate={updateWorkOrders} isLoading={isLoading} />
    </>
  );
}
