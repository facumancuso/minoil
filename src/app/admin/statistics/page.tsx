'use client';

import type { WorkOrder } from '@/lib/types';
import KpiCard from '@/components/dashboard/kpi-card';
import CycleTimeChart from '@/components/dashboard/cycle-time-chart';
import PlanningComplianceCard from '@/components/dashboard/planning-compliance-card';
import WarrantyRatioCard from '@/components/dashboard/warranty-ratio-card';
import AllClientOrderChart from '@/components/dashboard/all-client-order-chart';
import { ClipboardList } from 'lucide-react';
import { useCollection } from '@/hooks/use-collection';

export default function AdminStatisticsPage() {
  const { data: workOrders, isLoading } = useCollection<WorkOrder>('/api/work-orders');

  const totalOT = (workOrders || []).length;

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Estadísticas Generales
        </h1>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Total de OT"
            value={totalOT.toString()}
            icon={ClipboardList}
            description="Cantidad total de órdenes de trabajo"
          />
          <PlanningComplianceCard workOrders={workOrders || []} />
          <WarrantyRatioCard workOrders={workOrders || []} />
        </div>

        {/* Cycle Time Chart */}
        <CycleTimeChart workOrders={workOrders || []} />

        {/* OT por Cliente */}
        <AllClientOrderChart workOrders={workOrders || []} />
      </div>
    </>
  );
}
