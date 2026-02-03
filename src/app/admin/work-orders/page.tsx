'use client';

import type { WorkOrder } from '@/lib/types';
import { useState, useMemo } from 'react';
import RecentOrdersTable from '@/components/dashboard/recent-orders-table';
import { AddOrderDialog } from '@/components/work-order/add-order-dialog';
import { addWorkOrderAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useWorkOrders } from '@/hooks/use-data';


export default function AdminWorkOrdersPage() {
  const { data: allWorkOrders, isLoading, refresh } = useWorkOrders();

  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const { toast } = useToast();

  const activeWorkOrders = useMemo(() => {
    if (!allWorkOrders) return [];
    return allWorkOrders.filter(o =>
      o.status !== 'Entregado' && o.status !== 'Rechazado por Cliente'
    );
  }, [allWorkOrders]);

  const handleAddOrder = async (data: any) => {
    try {
      const result = await addWorkOrderAction(data);
      if (result.success && result.newOrder) {
        setIsAddOrderOpen(false);
        toast({
          title: "Orden Agregada",
          description: `La orden de trabajo ${result.newOrder.id} ha sido creada.`,
        });
        refresh(); // Refresh list after add
      } else {
        toast({
          variant: "destructive",
          title: "Error al crear la orden",
          description: result.error || "No se pudo agregar la orden de trabajo.",
        });
      }
      return result;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description: "Ocurrió un error inesperado al crear la orden.",
      });
      throw error;
    }
  };

  const updateWorkOrders = () => {
    refresh();
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Gestión de Órdenes de Trabajo Activas
        </h1>
        <Button size="sm" className="gap-1" onClick={() => setIsAddOrderOpen(true)}>
          <PlusCircle className="h-4 w-4" />
          Nueva Orden
        </Button>
      </div>
      <RecentOrdersTable workOrders={activeWorkOrders} onUpdate={updateWorkOrders} isLoading={isLoading} />
      <AddOrderDialog isOpen={isAddOrderOpen} onOpenChange={setIsAddOrderOpen} onAddOrder={handleAddOrder} />
    </>
  );
}
