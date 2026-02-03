
'use client';

import type { WorkOrder } from '@/lib/types';
import { useMemo } from 'react';
import RecentOrdersTable from '@/components/dashboard/recent-orders-table';
import { useCollection } from '@/hooks/use-collection';

export default function AdminHistoryPage() {
  const { data: allWorkOrders, isLoading } = useCollection<WorkOrder>('/api/work-orders');

  const finishedOrders = useMemo(() => {
    if (!allWorkOrders) return [];
    // Include Entregado in finished orders
    return allWorkOrders.filter(o => 
      o.status === 'Entregado' || o.status === 'Rechazado por Cliente'
    );
  }, [allWorkOrders]);
  
  const handleUpdate = () => {
    // Local state management as needed
  };

  return (
    <>
       <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
            Historial de Órdenes Completadas
        </h1>
      </div>
      <RecentOrdersTable 
        workOrders={finishedOrders} 
        onUpdate={handleUpdate} 
        readOnly={false} 
        isLoading={isLoading}
      />
    </>
  );
}
