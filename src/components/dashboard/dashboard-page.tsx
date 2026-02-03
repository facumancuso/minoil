
"use client";

import type { WorkOrder } from "@/lib/types";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import RecentOrdersTable from "@/components/dashboard/recent-orders-table";
import { AddOrderDialog } from "@/components/work-order/add-order-dialog";
import { addWorkOrderAction } from "@/app/actions";

export default function DashboardPage({ initialWorkOrders }: { initialWorkOrders: WorkOrder[] }) {
  const [isAddOrderOpen, setIsAddOrderOpen] = useState(false);
  const { toast } = useToast();

  const handleAddOrder = async (data: any) => {
    try {
      await addWorkOrderAction(data);
      setIsAddOrderOpen(false);
      toast({
        title: "Orden Agregada",
        description: `La orden de trabajo ${data.id} ha sido creada exitosamente.`,
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
    <div className="flex min-h-screen w-full flex-col bg-background">
      <DashboardHeader onAddOrder={() => setIsAddOrderOpen(true)} />
      <main className="flex flex-1 flex-col gap-4 p-4 sm:px-6 md:gap-8">
        <RecentOrdersTable workOrders={initialWorkOrders} />
      </main>
      <AddOrderDialog isOpen={isAddOrderOpen} onOpenChange={setIsAddOrderOpen} onAddOrder={handleAddOrder} />
    </div>
  );
}
