
import React from 'react';
import { format, differenceInBusinessDays, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { WorkOrder } from '@/lib/types';
import { Logo } from '../icons/logo';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';

interface PrintableWorkOrderProps {
  order: WorkOrder;
}

const formatDate = (date: any): string => {
    if (!date) return '---';
    try {
        const d = date.seconds ? new Date(date.seconds * 1000) : (typeof date === 'string' ? parseISO(date) : date);
        if (!isValid(d)) return '---';
        const userTimezoneOffset = d.getTimezoneOffset() * 60000;
        return format(new Date(d.getTime() + userTimezoneOffset), 'dd/MM/yyyy');
    } catch {
        return '---';
    }
}

const formatBoolean = (value: any) => {
    if (typeof value !== 'boolean') return 'N/A';
    return value ? 'SÍ' : 'NO';
}

const calculateBusinessDays = (start: any, end: any, isDynamicEnd = false) => {
    const startDate = start ? (start.seconds ? new Date(start.seconds * 1000) : new Date(start)) : null;
    let endDate = end ? (end.seconds ? new Date(end.seconds * 1000) : new Date(end)) : null;

    if (isDynamicEnd && !endDate) {
        endDate = new Date();
    }

    if (!startDate || !endDate || !isValid(startDate) || !isValid(endDate)) return '--';
    const days = differenceInBusinessDays(endDate, startDate);
    return `${days} día(s) hábiles`;
}


export const PrintableWorkOrder = React.forwardRef<HTMLDivElement, PrintableWorkOrderProps>(({ order }, ref) => {
  const getNoteDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  };
  
  const sortedNotes = order.notes?.sort((a, b) => getNoteDate(a.timestamp).getTime() - getNoteDate(b.timestamp).getTime()) || [];

  return (
    <div ref={ref} className="p-8 font-sans text-gray-800 bg-white">
      <header className="flex justify-between items-center pb-4 border-b-2 border-gray-300">
        <div className="flex items-center gap-4">
          <Logo className="h-16 w-16 text-gray-700" />
          <div>
            <h1 className="text-3xl font-bold">Minoil</h1>
            <p className="text-sm text-gray-500">Ficha Técnica de Orden de Trabajo</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold">OT: {order.id}</h2>
          <p className="text-sm">Fecha Impresión: {format(new Date(), "dd/MM/yyyy")}</p>
        </div>
      </header>

      <section className="my-6">
        <h3 className="text-xl font-semibold mb-3 border-b pb-2">Información Principal</h3>
        <div className="grid grid-cols-3 gap-x-8 gap-y-4 text-sm">
            <div><strong>Nº OT:</strong><p>{order.id}</p></div>
            <div><strong>Fecha Ingreso:</strong><p>{formatDate(order.createdAt)}</p></div>
            <div><strong>Cliente:</strong><p>{order.client}</p></div>
            
            <div><strong>Componente:</strong><p>{order.component}</p></div>
            <div><strong>Marca:</strong><p>{order.brand}</p></div>
            <div><strong>Modelo/Serie Equipo:</strong><p>{order.equipment}</p></div>
            
            <div><strong>Nº Serie Componente:</strong><p>{order.serialNumber}</p></div>
            <div><strong>Tipo de Reparación:</strong><p>{order.workOrderType}</p></div>
            <div><strong>Estado Actual:</strong> <Badge variant="outline">{order.status}</Badge></div>

            <div><strong>SOLPED/REQUI:</strong><p>{order.solped || '---'}</p></div>
            <div><strong>Orden de Compra:</strong><p>{order.purchaseOrder || '---'}</p></div>
        </div>
      </section>
      
      <Separator className="my-6"/>

      <section className="my-6">
        <h3 className="text-xl font-semibold mb-3 border-b pb-2">Seguimiento de Hitos y Tiempos</h3>
        <div className="grid grid-cols-3 gap-x-8 gap-y-2 text-sm">
            <div className="col-span-3 font-medium text-gray-600 mb-1">Fechas Clave:</div>
            <div><span>Ingreso a Taller:</span> <span className="font-mono ml-2">{formatDate(order.createdAt)}</span></div>
            <div><span>Inicio Desarme:</span> <span className="font-mono ml-2">{formatDate(order.disassemblyStartDate)}</span></div>
            <div><span>Fin Evaluación:</span> <span className="font-mono ml-2">{formatDate(order.evaluationEndDate)}</span></div>
            <div><span>Cotización a Cliente:</span> <span className="font-mono ml-2">{formatDate(order.clientQuotationDate)}</span></div>
            <div><span>Llegada Repuestos:</span> <span className="font-mono ml-2">{formatDate(order.partsArrivalDate)}</span></div>
            <div><span>Inicio Armado:</span> <span className="font-mono ml-2">{formatDate(order.assemblyStartDate)}</span></div>
            <div><span>Fin Armado:</span> <span className="font-mono ml-2">{formatDate(order.assemblyEndDate)}</span></div>
            <div><span>Entrega a Cliente:</span> <span className="font-mono ml-2">{formatDate(order.deliveryDate)}</span></div>

            <div className="col-span-3 mt-3"><Separator/></div>
            
            <div className="col-span-3 font-medium text-gray-600 mb-1 mt-2">Decisiones y Flags:</div>
            <div><span>Viable para Reparación:</span> <span className="font-bold ml-2">{formatBoolean(order.isViableForRepair)}</span></div>
            <div><span>Uso de Stock:</span> <span className="font-bold ml-2">{formatBoolean(order.isStockUsage)}</span></div>
            <div><span>Repuestos Completos:</span> <span className="font-bold ml-2">{formatBoolean(order.partsArrivalComplete)}</span></div>

            <div className="col-span-3 mt-3"><Separator/></div>
            
            <div className="col-span-3 font-medium text-gray-600 mb-1 mt-2">Tiempos y Métricas (Calculados):</div>
            <div><span>Espera Desarme:</span> <span className="font-mono ml-2">{calculateBusinessDays(order.createdAt, order.disassemblyStartDate, true)}</span></div>
            <div><span>Tiempo Desarme:</span> <span className="font-mono ml-2">{calculateBusinessDays(order.disassemblyStartDate, order.evaluationEndDate, true)}</span></div>
            <div><span>Tiempo Armado:</span> <span className="font-mono ml-2">{order.assemblyTimeHours ? `${order.assemblyTimeHours} horas` : '--'}</span></div>
            <div><span>Delta Cumplimiento:</span> <span className="font-mono ml-2">{order.deliveryComplianceDelta ? `${order.deliveryComplianceDelta} días` : '--'}</span></div>
        </div>
      </section>

       {order.spareParts && order.spareParts.length > 0 && (
         <section className="my-6">
            <h3 className="text-xl font-semibold mb-3 border-b pb-2">Listado de Repuestos</h3>
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="font-semibold py-2">Descripción</th>
                        <th className="font-semibold py-2 text-center w-24">Cantidad</th>
                        <th className="font-semibold py-2 text-right w-32">Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {order.spareParts.map(part => (
                        <tr key={part.id} className="border-b border-gray-200">
                            <td className="py-2">{part.description}</td>
                            <td className="py-2 text-center">{part.quantity}</td>
                            <td className="py-2 text-right">{part.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
         </section>
       )}

      <section className="my-6">
        <h3 className="text-xl font-semibold mb-3 border-b pb-2">Historial de Observaciones</h3>
        <div className="space-y-3 text-sm">
            {sortedNotes.length > 0 ? (
            sortedNotes.map((note, index) => (
                <div key={index} className="grid grid-cols-4 gap-4 pt-2 border-t">
                    <div className="col-span-1">
                        <p className="font-semibold">{note.status}</p>
                        <p className="text-xs text-gray-500">{format(getNoteDate(note.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}</p>
                        <p className="text-xs text-gray-500">por: {note.user.split('@')[0]}</p>
                    </div>
                    <div className="col-span-3">
                        <p>{note.note}</p>
                    </div>
                </div>
            ))
            ) : (
            <p className="text-sm text-gray-500 text-center py-4">No hay historial de notas para esta orden.</p>
            )}
        </div>
      </section>

      <footer className="pt-4 mt-8 border-t-2 border-gray-300 text-center text-xs text-gray-400">
        <p>MineOps - Gestión de Componentes Mineros</p>
        <p>Documento generado el {format(new Date(), "'el' d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}</p>
      </footer>
    </div>
  );
});

PrintableWorkOrder.displayName = 'PrintableWorkOrder';
