
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
  { id: 'Simulacion', label: 'Simulación', color: '#38bdf8' },
  { id: 'Cotizacion', label: 'Cotización', color: '#60a5fa' },
  { id: 'Cotizacion al cliente', label: 'Cotiz. Cliente', color: '#a78bfa' },
  { id: 'Espera de repuesto', label: 'Esp. Repuesto', color: '#f97316' },
  { id: 'Llegada de Repuesto', label: 'Llegada Rep.', color: '#14b8a6' },
  { id: 'Rechazado por Cliente', label: 'Rechazado', color: '#ef4444' },
  { id: 'Armado', label: 'Armado', color: '#22c55e' },
  { id: 'Listo para Entregar', label: 'Listo', color: '#10b981' },
  { id: 'Entregado', label: 'Entregado', color: '#059669' },
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
  mechanics?: number;
  realEndDate?: Date;
  estimatedEndDate?: Date;
}

interface WorkOrderWithBlocks extends WorkOrder {
  ganttBlocks: GanttBlock[];
}

const getDate = (date: any): Date | undefined => {
  if (!date) return undefined;
  if (date.seconds) return new Date(date.seconds * 1000);
  if (typeof date === 'string') return new Date(date);
  if (date instanceof Date) return date;
  return undefined;
}

const generateBlocksFromDates = (order: WorkOrder): GanttBlock[] => {
  const blocks: GanttBlock[] = [];
  const now = new Date();

  // Crear un mapa de etapas con sus fechas disponibles
  interface StageInfo {
    status: Status;
    startDate?: Date;
    endDate?: Date;
    estimatedEndDate?: Date;
    mechanics?: number;
    noteText?: string;
  }

  const stageMap: Record<Status, StageInfo> = {
    'Espera de Desarme y Evaluación': {
      status: 'Espera de Desarme y Evaluación',
      startDate: getDate(order.createdAt),
    },
    'Desarme y Evaluación': {
      status: 'Desarme y Evaluación',
      startDate: getDate(order.evaluationStartDate),
      endDate: getDate(order.evaluationEndDate),
      estimatedEndDate: getDate(order.evaluationEstimatedEndDate),
      mechanics: order.evaluationMechanics,
    },
    'Simulacion': {
      status: 'Simulacion',
    },
    'Cotizacion': {
      status: 'Cotizacion',
    },
    'Cotizacion al cliente': {
      status: 'Cotizacion al cliente',
    },
    'Espera de repuesto': {
      status: 'Espera de repuesto',
      estimatedEndDate: getDate(order.sparePartsEstimatedArrivalDate),
      endDate: getDate(order.sparePartsArrivalDate),
    },
    'Llegada de Repuesto': {
      status: 'Llegada de Repuesto',
      startDate: getDate(order.sparePartsArrivalDate),
    },
    'Rechazado por Cliente': {
      status: 'Rechazado por Cliente',
    },
    'Armado': {
      status: 'Armado',
      startDate: getDate(order.assemblyStartDate),
      endDate: getDate(order.assemblyEndDate),
      estimatedEndDate: getDate(order.assemblyEstimatedEndDate),
      mechanics: order.assemblyMechanics,
    },
    'Listo para Entregar': {
      status: 'Listo para Entregar',
      startDate: getDate(order.assemblyEndDate),
    },
    'Entregado': {
      status: 'Entregado',
    },
    'Espera de Retiro': {
      status: 'Espera de Retiro',
    },
  };

  // Usar el historial de notas para reconstruir todas las etapas en orden cronológico
  if (order.notes && order.notes.length > 0) {
    // Ordenar notas por timestamp
    const sortedNotes = [...order.notes].sort((a, b) => {
      const dateA = getDate(a.timestamp);
      const dateB = getDate(b.timestamp);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });

    // Crear lista de cambios de estado únicos en orden cronológico
    const stateSequence: { status: Status; timestamp: Date; note?: string }[] = [];
    let lastStatus: Status | null = null;

    for (const note of sortedNotes) {
      if (note.status !== lastStatus) {
        const timestamp = getDate(note.timestamp);
        if (timestamp) {
          stateSequence.push({
            status: note.status,
            timestamp,
            note: note.note,
          });
          lastStatus = note.status;
        }
      }
    }

    // Crear bloques para cada etapa en la secuencia
    for (let i = 0; i < stateSequence.length; i++) {
      const currentState = stateSequence[i];
      const nextState = stateSequence[i + 1];

      const startDate = currentState.timestamp;
      let endDate: Date;

      // La fecha de fin es el inicio de la siguiente etapa, o ahora si es la última
      if (nextState) {
        endDate = nextState.timestamp;
      } else {
        endDate = now;
      }

      // Obtener información específica de la etapa
      const stageInfo = stageMap[currentState.status];
      let mechanics: number | undefined;
      let realEndDate: Date | undefined;
      let estimatedEndDate: Date | undefined;

      if (stageInfo) {
        mechanics = stageInfo.mechanics;
        estimatedEndDate = stageInfo.estimatedEndDate;
        realEndDate = stageInfo.endDate;

        // Si tenemos fecha real de fin para esta etapa, usarla si hay siguiente etapa
        if (realEndDate && nextState) {
          endDate = realEndDate;
        }
      }

      const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)));

      blocks.push({
        startDay: startDate,
        endDay: endDate,
        stage: currentState.status,
        note: currentState.note,
        duration,
        mechanics,
        realEndDate,
        estimatedEndDate
      });
    }
  } else {
    // Fallback: usar fechas específicas si no hay historial de notas
    // Construir una secuencia de bloques basados en las fechas disponibles y el estado actual

    const createdAt = getDate(order.createdAt);
    const evalStart = getDate(order.evaluationStartDate);
    const evalEnd = getDate(order.evaluationEndDate);
    const evalEstEnd = getDate(order.evaluationEstimatedEndDate);

    const assemblyStart = getDate(order.assemblyStartDate);
    const assemblyEnd = getDate(order.assemblyEndDate);
    const assemblyEstEnd = getDate(order.assemblyEstimatedEndDate);

    const sparePartsArrivalDate = getDate(order.sparePartsArrivalDate);
    const sparePartsEstimatedDate = getDate(order.sparePartsEstimatedArrivalDate);

    // Crear bloques en orden cronológico basándose en fechas disponibles
    const blockCandidates: { date: Date; stage: Status; type: 'start' | 'end' }[] = [];

    // Recolectar todos los puntos de inicio/fin de etapas
    if (createdAt) blockCandidates.push({ date: createdAt, stage: 'Espera de Desarme y Evaluación', type: 'start' });
    if (evalStart) blockCandidates.push({ date: evalStart, stage: 'Desarme y Evaluación', type: 'start' });
    if (evalEnd) blockCandidates.push({ date: evalEnd, stage: 'Desarme y Evaluación', type: 'end' });
    if (sparePartsEstimatedDate) blockCandidates.push({ date: sparePartsEstimatedDate, stage: 'Espera de repuesto', type: 'start' });
    if (sparePartsArrivalDate) blockCandidates.push({ date: sparePartsArrivalDate, stage: 'Llegada de Repuesto', type: 'start' });
    if (assemblyStart) blockCandidates.push({ date: assemblyStart, stage: 'Armado', type: 'start' });
    if (assemblyEnd) blockCandidates.push({ date: assemblyEnd, stage: 'Armado', type: 'end' });

    // Ordenar por fecha
    blockCandidates.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Crear bloques basándose en la secuencia de fechas
    if (createdAt) {
      // Espera de Desarme y Evaluación
      const waitEnd = evalStart || now;
      blocks.push({
        startDay: createdAt,
        endDay: waitEnd,
        stage: 'Espera de Desarme y Evaluación',
        duration: Math.max(1, Math.ceil((waitEnd.getTime() - createdAt.getTime()) / (1000 * 3600 * 24))),
      });
    }

    // Desarme y Evaluación
    if (evalStart) {
      let displayEnd = evalEnd || evalEstEnd || now;
      if (!evalEnd && order.status === 'Desarme y Evaluación') {
        displayEnd = now;
      }
      blocks.push({
        startDay: evalStart,
        endDay: displayEnd,
        stage: 'Desarme y Evaluación',
        duration: Math.max(1, Math.ceil((displayEnd.getTime() - evalStart.getTime()) / (1000 * 3600 * 24))),
        mechanics: order.evaluationMechanics,
        realEndDate: evalEnd,
        estimatedEndDate: evalEstEnd
      });
    }

    // Espera de repuesto (si hay fechas de repuestos)
    if (sparePartsEstimatedDate && !evalStart) {
      // Solo mostrar si no hay información de evaluación
      let displayEnd = sparePartsArrivalDate || sparePartsEstimatedDate || now;
      blocks.push({
        startDay: sparePartsEstimatedDate,
        endDay: displayEnd,
        stage: 'Espera de repuesto',
        duration: Math.max(1, Math.ceil((displayEnd.getTime() - sparePartsEstimatedDate.getTime()) / (1000 * 3600 * 24))),
        estimatedEndDate: sparePartsEstimatedDate,
        realEndDate: sparePartsArrivalDate
      });
    }

    // Llegada de Repuesto
    if (sparePartsArrivalDate) {
      const repEnd = assemblyStart || now;
      blocks.push({
        startDay: sparePartsArrivalDate,
        endDay: repEnd,
        stage: 'Llegada de Repuesto',
        duration: Math.max(1, Math.ceil((repEnd.getTime() - sparePartsArrivalDate.getTime()) / (1000 * 3600 * 24))),
      });
    }

    // Armado
    if (assemblyStart) {
      let displayEnd = assemblyEnd || assemblyEstEnd || now;
      if (!assemblyEnd && order.status === 'Armado') {
        displayEnd = now;
      }
      blocks.push({
        startDay: assemblyStart,
        endDay: displayEnd,
        stage: 'Armado',
        duration: Math.max(1, Math.ceil((displayEnd.getTime() - assemblyStart.getTime()) / (1000 * 3600 * 24))),
        mechanics: order.assemblyMechanics,
        realEndDate: assemblyEnd,
        estimatedEndDate: assemblyEstEnd
      });
    }

    // Bloque para etapa actual si no se ha capturado aún
    if (order.status === 'Listo para Entregar' || order.status === 'Entregado' || order.status === 'Espera de Retiro') {
      const stageStart = assemblyEnd || assemblyStart || now;
      if (!blocks.some(b => b.stage === order.status)) {
        blocks.push({
          startDay: stageStart,
          endDay: now,
          stage: order.status,
          duration: Math.max(1, Math.ceil((now.getTime() - stageStart.getTime()) / (1000 * 3600 * 24))),
        });
      }
    }
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
      ganttBlocks: generateBlocksFromDates(wo),
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

  const dayWidth = 32; // Fixed width for each day cell in pixels

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
        {/* Leyenda de etapas */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b">
          {STAGES.map((stage) => (
            <div key={stage.id} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: stage.color }}
              />
              <span className="text-xs text-muted-foreground">{stage.label}</span>
            </div>
          ))}
        </div>
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
                    <div className="w-full">
                      <p className="font-medium text-sm truncate">OT {order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{order.client}</p>
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
                            <div className="p-2 text-sm space-y-1">
                              <p className="font-bold border-b pb-1 mb-1">{stageConfig[block.stage]?.label || block.stage}</p>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                <span className="text-muted-foreground">Duración:</span>
                                <span>{block.duration} día(s)</span>

                                {block.mechanics !== undefined && (
                                  <>
                                    <span className="text-muted-foreground">Mecánicos:</span>
                                    <span>{block.mechanics}</span>
                                  </>
                                )}

                                <span className="text-muted-foreground">Inicio:</span>
                                <span>{format(block.startDay, 'dd/MM/yyyy', { locale: es })}</span>

                                {block.estimatedEndDate && (
                                  <>
                                    <span className="text-muted-foreground">Fin Estimado:</span>
                                    <span>{format(block.estimatedEndDate, 'dd/MM/yyyy', { locale: es })}</span>
                                  </>
                                )}

                                {block.realEndDate && (
                                  <>
                                    <span className="text-muted-foreground">Fin Real:</span>
                                    <span>{format(block.realEndDate, 'dd/MM/yyyy', { locale: es })}</span>
                                  </>
                                )}
                              </div>

                              {block.note && <p className="text-xs text-muted-foreground mt-2 border-t pt-1 max-w-xs">{block.note}</p>}
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
