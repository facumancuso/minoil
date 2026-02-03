
'use client';

import React, { useState, useMemo } from 'react';
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  getDaysInMonth,
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  differenceInDays,
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkOrder, Status } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

const STAGES: { id: Status; label: string; color: string }[] = [
  { id: 'Espera de Desarme y Evaluación', label: 'Espera Desarme', color: '#94a3b8' },
  { id: 'Desarme y Evaluación', label: 'Desarme', color: '#fbbf24' },
  { id: 'Simulacion', label: 'Simulacion', color: '#38bdf8' },
  { id: 'Cotizacion', label: 'Cotizacion', color: '#60a5fa' },
  { id: 'Cotizacion al cliente', label: 'Cotiz. Cliente', color: '#a78bfa' },
  { id: 'Espera de repuesto', label: 'Repuesto', color: '#f97316' },
  { id: 'Llegada de Repuesto', label: 'Llegada Rep.', color: '#14b8a6' },
  { id: 'Rechazado por Cliente', label: 'Rechazado', color: '#ef4444' },
  { id: 'Armado', label: 'Armado', color: '#f97316' },
  { id: 'Listo para Entregar', label: 'Listo', color: '#10b981' },
  { id: 'Espera de Retiro', label: 'Retiro', color: '#84cc16' },
];

const stageConfig = STAGES.reduce((acc, stage) => {
  acc[stage.id] = { color: stage.color, label: stage.label };
  return acc;
}, {} as Record<Status, { color: string; label: string }>);

interface GanttBlock {
  startDay: Date;
  endDay: Date;
  stage: Status;
  note?: string;
  duration: number;
}

interface WorkOrderWithBlocks extends WorkOrder {
  ganttBlocks: GanttBlock[];
}

const generateBlocksFromNotes = (order: WorkOrder): GanttBlock[] => {
  if (!order.notes || order.notes.length === 0) return [];

  const sortedNotes = [...order.notes].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const blocks: GanttBlock[] = [];

  for (let i = 0; i < sortedNotes.length; i++) {
    const currentNote = sortedNotes[i];
    const nextNote = sortedNotes[i + 1];

    const startDay = new Date(currentNote.timestamp);
    const endDay = nextNote ? new Date(nextNote.timestamp) : new Date();

    const duration = Math.max(1, Math.ceil((endDay.getTime() - startDay.getTime()) / (1000 * 3600 * 24)));

    blocks.push({
      startDay,
      endDay,
      stage: currentNote.status,
      note: currentNote.note,
      duration,
    });
  }
  return blocks;
};

export function InteractiveGanttChart({ workOrders }: { workOrders: WorkOrder[] }) {
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth()).toString());
  const [numberOfMonths, setNumberOfMonths] = useState(3);
  const [selectedClient, setSelectedClient] = useState('all');

  const workOrdersWithBlocks = useMemo(() => {
    return workOrders.map(wo => ({
      ...wo,
      ganttBlocks: generateBlocksFromNotes(wo),
    }));
  }, [workOrders]);

  const clients = useMemo(() => ['all', ...Array.from(new Set(workOrders.map(wo => wo.client)))], [workOrders]);

  const filteredWorkOrders = useMemo(() => {
    if (selectedClient === 'all') {
      return workOrdersWithBlocks;
    }
    return workOrdersWithBlocks.filter(order => order.client === selectedClient);
  }, [workOrdersWithBlocks, selectedClient]);

  const { months, days, totalDays, startDate, endDate } = useMemo(() => {
    const yearDate = new Date(parseInt(selectedYear, 10), parseInt(selectedMonth, 10));
    const startDate = startOfMonth(yearDate);
    const endDate = endOfMonth(addMonths(startDate, numberOfMonths - 1));

    const monthIntervals = eachMonthOfInterval({ start: startDate, end: endDate });

    const months = monthIntervals.map(monthStart => ({
      name: format(monthStart, 'MMMM yyyy', { locale: es }),
      days: getDaysInMonth(monthStart),
    }));

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return { months, days, totalDays: days.length, startDate, endDate };
  }, [selectedYear, selectedMonth, numberOfMonths]);

  const dayWidth = 32;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por Cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(client => (
                  <SelectItem key={client} value={client}>
                    {client === 'all' ? 'Todos los Clientes' : client}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-[120px]">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {format(new Date(2000, i), 'MMMM', { locale: es })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-64">
            <Label htmlFor="months-slider" className="whitespace-nowrap text-sm">
              Meses: {numberOfMonths}
            </Label>
            <Slider
              id="months-slider"
              min={1}
              max={12}
              step={1}
              value={[numberOfMonths]}
              onValueChange={(value) => setNumberOfMonths(value[0])}
              className="flex-1"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="relative" style={{ width: `${250 + totalDays * dayWidth}px` }}>
          {/* Timeline Header */}
          <div className="sticky top-0 z-20 grid bg-card" style={{ gridTemplateColumns: `250px 1fr` }}>
            <div className="border-r border-b p-2 font-semibold text-sm">Orden de Trabajo</div>
            <div className="relative border-b">
              <div className="flex h-full">
                {months.map((month, idx) => (
                  <div key={idx} className="text-center font-semibold p-2 border-r" style={{ width: `${month.days * dayWidth}px` }}>
                    {month.name}
                  </div>
                ))}
              </div>
            </div>
            <div className="sticky left-0 bg-card border-r"></div>
            <div className="relative flex h-8 items-stretch">
              {days.map((day, index) => (
                <div key={index} className="flex-shrink-0 flex items-center justify-center text-xs font-medium border-r" style={{ width: `${dayWidth}px` }}>
                  {format(day, 'd')}
                </div>
              ))}
            </div>
          </div>

          {/* Gantt Body */}
          <div className="relative">
            <div className="absolute top-0 left-0 h-full" style={{ width: `${totalDays * dayWidth}px` }}>
              {days.map((day, index) => (
                <div key={index} className="absolute top-0 h-full border-r border-border/50" style={{ left: `${(index + 1) * dayWidth}px` }}></div>
              ))}
            </div>

            <TooltipProvider>
              {filteredWorkOrders.map((order, orderIndex) => (
                <div key={order.id} className="grid items-center border-b" style={{ gridTemplateColumns: `250px 1fr`, height: '56px' }}>
                  {/* Order Info Column */}
                  <div className="sticky left-0 bg-card border-r h-full flex items-center p-2">
                    <div>
                      <p className="font-medium text-sm truncate">{order.id}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.component}</p>
                    </div>
                  </div>
                  {/* Timeline Column */}
                  <div className="relative h-full">
                    {order.ganttBlocks.map((block, index) => {
                      const start = new Date(block.startDay);
                      const end = new Date(block.endDay);

                      if (end < startDate || start > endDate) {
                        return null;
                      }

                      const clampedStart = start < startDate ? startDate : start;
                      const clampedEnd = end > endDate ? endDate : end;

                      const startOffsetDays = (clampedStart.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
                      const durationDays = Math.max(0.8, ((clampedEnd.getTime() - clampedStart.getTime()) / (1000 * 3600 * 24)) + 1);

                      const left = startOffsetDays * dayWidth;
                      const width = durationDays * dayWidth;

                      return (
                        <Tooltip key={index} delayDuration={100}>
                          <TooltipTrigger asChild>
                            <div
                              className="absolute top-1/2 -translate-y-1/2 h-6 rounded-md hover:ring-2 hover:ring-primary/50 cursor-pointer transition-all flex items-center px-2"
                              style={{
                                left: `${left}px`,
                                width: `${width}px`,
                                backgroundColor: stageConfig[block.stage]?.color || '#ccc',
                              }}
                            >
                              <span className="text-xs font-medium text-white truncate mix-blend-luminosity">{stageConfig[block.stage]?.label}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="p-1 text-sm">
                              <p className="font-bold">{stageConfig[block.stage]?.label || block.stage}</p>
                              <p>Duración: {block.duration} día(s)</p>
                              {block.note && <p className="text-xs text-muted-foreground mt-1 max-w-xs">{block.note}</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
