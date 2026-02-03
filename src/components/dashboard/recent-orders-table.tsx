
"use client";

import React, { useState, useMemo } from 'react';
import { format, formatDistanceToNowStrict, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { WorkOrder, Status, EvaluationReport } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, ArrowUpDown, History, FileText, ChevronDown, ChevronRight, Pencil, ShieldCheck, Wrench, Clock, Download, FileArchive, Trash2, Undo } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { UpdateOrderDialog } from '@/components/work-order/update-order-dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViewOrderHistoryDialog } from '../work-order/view-order-history-dialog-alternative';
import { QuotationDialog } from '../work-order/quotation-dialog';
import { Separator } from '../ui/separator';
import { EditOrderDialog } from '../work-order/edit-order-dialog';
import { useWorkOrderCalculations } from '@/hooks/use-work-order-calculations';
import { getFileIcon } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Skeleton } from '../ui/skeleton';
import { DeleteOrderDialog } from '../work-order/delete-order-dialog';
import { RestoreOrderDialog } from '../work-order/restore-order-dialog';

type RecentOrdersTableProps = {
  workOrders: WorkOrder[];
  onUpdate?: (order: WorkOrder) => void;
  readOnly?: boolean;
  isLoading?: boolean;
};

const statusColors: Record<Status, string> = {
  'Espera de Desarme y Evaluación': 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
  'Desarme y Evaluación': 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
  'Simulacion': 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
  'Cotizacion': 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 border-indigo-500/30',
  'Cotizacion al cliente': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
  'Rechazado por Cliente': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  'Espera de repuesto': 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
  'Llegada de Repuesto': 'bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-500/30',
  'Armado': 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-500/30',
  'Listo para Entregar': 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
  'Entregado': 'bg-lime-500/20 text-lime-700 dark:text-lime-400 border-lime-500/30',
  'Espera de Retiro': 'bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-500/30', // Legacy
};


const statuses: Status[] = [
  'Espera de Desarme y Evaluación',
  'Desarme y Evaluación',
  'Simulacion',
  'Cotizacion',
  'Cotizacion al cliente',
  'Espera de repuesto',
  'Llegada de Repuesto',
  'Armado',
  'Listo para Entregar',
];

export default function RecentOrdersTable({ workOrders, onUpdate, readOnly = false, isLoading = false }: RecentOrdersTableProps) {
  const [filter, setFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof WorkOrder; direction: 'ascending' | 'descending' } | null>({ key: 'createdAt', direction: 'descending' });
  const [updateOrder, setUpdateOrder] = useState<WorkOrder | null>(null);
  const [editOrder, setEditOrder] = useState<WorkOrder | null>(null);
  const [viewHistoryOrder, setViewHistoryOrder] = useState<WorkOrder | null>(null);
  const [quotationOrder, setQuotationOrder] = useState<WorkOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<WorkOrder | null>(null);
  const [restoreOrder, setRestoreOrder] = useState<WorkOrder | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedRows(newSet);
  };

  const filteredAndSortedOrders = useMemo(() => {
    let sortableItems = [...workOrders];

    if (statusFilter !== 'all') {
      sortableItems = sortableItems.filter(item => item.status === statusFilter);
    }

    if (filter) {
      sortableItems = sortableItems.filter(item =>
        Object.values(item).some(val =>
          String(val).toLowerCase().includes(filter.toLowerCase())
        ) || item.id.toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [workOrders, filter, statusFilter, sortConfig]);

  const requestSort = (key: keyof WorkOrder) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof WorkOrder) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  const getDaysInStatus = (order: WorkOrder) => {
    const toDate = (timestamp: any): Date | null => {
      if (!timestamp) return null;
      if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
      const d = new Date(timestamp);
      return isNaN(d.getTime()) ? null : d;
    };

    const firstDate = toDate(order.createdAt);
    if (!firstDate) return 'N/A';

    if (!order.notes || order.notes.length === 0) {
      return formatDistanceToNowStrict(firstDate, { locale: es, unit: 'day' });
    }

    const lastNote = order.notes[order.notes.length - 1];
    const lastNoteDate = toDate(lastNote.timestamp);

    if (!lastNoteDate) {
      return formatDistanceToNowStrict(firstDate, { locale: es, unit: 'day' });
    }

    return formatDistanceToNowStrict(lastNoteDate, { locale: es, unit: 'day' });
  };

  const isHistoryTable = readOnly;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {isHistoryTable ? "Historial de Órdenes" : "Órdenes de Trabajo"}
          </CardTitle>
          <CardDescription>
            {isHistoryTable ? "Una lista de todas las órdenes de trabajo completadas o rechazadas." :
              'Una lista de las órdenes de trabajo más recientes. Haz clic en una fila para ver detalles.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div className="w-full sm:max-w-xs">
              <Input
                placeholder="Buscar por OT, cliente, componente..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            {!isHistoryTable && (
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full overflow-x-auto">
                <TabsList className="w-max">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  {statuses.map(status => (
                    <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead onClick={() => requestSort('id')} className="cursor-pointer">N° OT {getSortIcon('id')}</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead onClick={() => requestSort('client')} className="cursor-pointer hidden sm:table-cell">Cliente {getSortIcon('client')}</TableHead>
                  <TableHead>Componente</TableHead>
                  <TableHead onClick={() => requestSort('status')} className="cursor-pointer">Estado {getSortIcon('status')}</TableHead>
                  <TableHead className="hidden md:table-cell">Tiempo en Etapa</TableHead>
                  <TableHead><span className="sr-only">Acciones</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell colSpan={8}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredAndSortedOrders.map((order) => {
                    const isExpanded = expandedRows.has(order.id);
                    return (
                      <React.Fragment key={order.id}>
                        <TableRow onClick={() => toggleRow(order.id)} className="hover:bg-muted/50 transition-colors cursor-pointer">
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium whitespace-nowrap">{order.orderNumber}</TableCell>
                          <TableCell>
                            <Badge variant={order.workOrderType === 'Garantía' ? 'default' : 'secondary'} className="whitespace-nowrap">
                              {order.workOrderType === 'Garantía' ? <ShieldCheck className="h-3 w-3 mr-1" /> : <Wrench className="h-3 w-3 mr-1" />}
                              {order.workOrderType}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">{order.client}</TableCell>
                          <TableCell>
                            <div className="font-medium">{order.component}</div>
                            <div className="text-sm text-muted-foreground md:inline">{order.equipment} / {order.brand}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${statusColors[order.status] || ''} whitespace-nowrap`}>{order.status}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>{getDaysInStatus(order)}</span>
                            </div>
                          </TableCell>
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Alternar menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {isHistoryTable ? (
                                  <DropdownMenuItem onSelect={() => setRestoreOrder(order)}>
                                    <Undo className="mr-2 h-4 w-4" />
                                    Restaurar a Activas
                                  </DropdownMenuItem>
                                ) : (
                                  <>
                                    <DropdownMenuItem onSelect={() => setUpdateOrder(order)}>Actualizar Estado</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => setEditOrder(order)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Editar Detalles
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {order.status === 'Cotizacion' && !isHistoryTable && (
                                  <DropdownMenuItem onSelect={() => setQuotationOrder(order)}>
                                    <FileText className="mr-2 h-4 w-4" />
                                    Ver/Crear Cotización
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => setViewHistoryOrder(order)}>
                                  <History className="mr-2 h-4 w-4" />
                                  Ver Historial y Ficha
                                </DropdownMenuItem>
                                {!isHistoryTable && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => setDeleteOrder(order)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Eliminar Orden
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={8} className="p-0">
                              <DetailedOrderView order={order} />
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {updateOrder && (
        <UpdateOrderDialog
          isOpen={!!updateOrder}
          onOpenChange={() => setUpdateOrder(null)}
          onUpdate={onUpdate!}
          order={updateOrder}
        />
      )}
      {editOrder && (
        <EditOrderDialog
          isOpen={!!editOrder}
          onOpenChange={() => setEditOrder(null)}
          onUpdate={onUpdate!}
          order={editOrder}
        />
      )}
      {viewHistoryOrder && (
        <ViewOrderHistoryDialog
          isOpen={!!viewHistoryOrder}
          onOpenChange={() => setViewHistoryOrder(null)}
          order={viewHistoryOrder}
        />
      )}
      {quotationOrder && (
        <QuotationDialog
          isOpen={!!quotationOrder}
          onOpenChange={() => setQuotationOrder(null)}
          order={quotationOrder}
        />
      )}
      {deleteOrder && (
        <DeleteOrderDialog
          isOpen={!!deleteOrder}
          onOpenChange={() => setDeleteOrder(null)}
          order={deleteOrder}
          onOrderDeleted={() => {
            setDeleteOrder(null);
            onUpdate?.();
          }}
        />
      )}
      {restoreOrder && (
        <RestoreOrderDialog
          isOpen={!!restoreOrder}
          onOpenChange={() => setRestoreOrder(null)}
          order={restoreOrder}
          onOrderRestored={() => {
            setRestoreOrder(null);
            onUpdate?.();
          }}
        />
      )}
    </>
  );
}

function DetailedOrderView({ order }: { order: WorkOrder }) {
  const formatDate = (date: any): string => {
    if (!date) return '---';
    try {
      const d = date.seconds ? new Date(date.seconds * 1000) : (typeof date === 'string' ? parseISO(date) : date);
      const userTimezoneOffset = d.getTimezoneOffset() * 60000;
      return format(new Date(d.getTime() + userTimezoneOffset), 'dd/MM/yyyy');
    } catch (e) {
      return '---';
    }
  };

  const formatBoolean = (value: any) => typeof value === 'boolean' ? (value ? 'SÍ' : 'NO') : 'N/A';
  const { evaluationWaitTime, evaluationTime, calculatedManHours, assemblyTime, calculatedAssemblyManHours } = useWorkOrderCalculations(order);

  const handleDownload = (report: EvaluationReport) => {
    const blob = new Blob(["Este es un archivo de demostración."], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = report.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const evaluationReports = order.evaluationReports || [];
  const supplierQuotes = order.supplierQuotes || [];
  const clientQuotes = order.clientQuotes || [];
  const purchaseOrderFiles = order.purchaseOrderFiles || [];

  const renderIndicator = (label: string, value: string | number | null | undefined) => (
    <div className="space-y-1">
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{value ?? '---'}</p>
    </div>
  );

  return (
    <div className="bg-muted/50 p-4 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-x-6 gap-y-6 text-sm">

        {/* Columna 1: Ingreso y Planificación */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Ingreso y Planificación</h4>
          {renderIndicator("Fecha Ingreso Taller", formatDate(order.createdAt))}
          {renderIndicator("Fecha Estimada Inicio D&E", formatDate(order.estimatedEvaluationStartDate))}
          {renderIndicator("Días en Espera a Desarme", evaluationWaitTime !== null ? `${evaluationWaitTime} días` : null)}
        </div>

        {/* Columna 2: Desarme y Evaluación */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Desarme y Evaluación</h4>
          {renderIndicator("Inicio Desarme", formatDate(order.evaluationStartDate))}
          {renderIndicator("Fin Estimada D&E", formatDate(order.evaluationEstimatedEndDate))}
          {renderIndicator("Fin Evaluación", formatDate(order.evaluationEndDate))}
          {renderIndicator("Mecánicos en Desarme", order.evaluationMechanics)}
          {renderIndicator("Tiempo Desarme (días)", evaluationTime !== null ? `${evaluationTime} días` : null)}
          {renderIndicator("Horas-Hombre Desarme", calculatedManHours ? `${calculatedManHours} HH` : null)}
          {renderIndicator("Reparación Viable", formatBoolean(order.isViableForRepair))}
        </div>

        {/* Columna 3: Cotización */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Cotización</h4>
          {renderIndicator("Fecha Rec. Cotización Prov.", formatDate(order.supplierQuotationDate))}
          {renderIndicator("Cotización a Cliente", formatDate(order.clientQuotationDate))}
          {renderIndicator("Fecha Aprobación Cliente", formatDate(order.clientQuotationApprovalDate))}
        </div>

        {/* Columna 4: Espera de Repuesto */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Espera de Repuesto</h4>
          {renderIndicator("Estimada Llegada Repuesto", formatDate(order.sparePartsEstimatedArrivalDate))}
          {renderIndicator("Fecha Estimada Entrega", formatDate(order.estimatedDeliveryDate))}
        </div>

        {/* Columna 5: Llegada de Repuesto */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Llegada de Repuesto</h4>
          {renderIndicator("Llegada Real Repuesto", formatDate(order.sparePartsArrivalDate))}
        </div>

        {/* Columna 6: Armado */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Armado</h4>
          {renderIndicator("Uso de Stock", formatBoolean(order.isStockUsage))}
          {renderIndicator("Inicio Armado", formatDate(order.assemblyStartDate))}
          {renderIndicator("Fin Estimado Armado", formatDate(order.assemblyEstimatedEndDate))}
          {renderIndicator("Mecánicos en Armado", order.assemblyMechanics)}
        </div>

        {/* Columna 7: Finalización */}
        <div className="space-y-4">
          <h4 className="font-semibold text-foreground border-b pb-2">Finalización</h4>
          {renderIndicator("Fin Armado", formatDate(order.assemblyEndDate))}
          {renderIndicator("Tiempo Armado (días)", assemblyTime !== null ? `${assemblyTime} días` : null)}
          {renderIndicator("Horas-Hombre Armado", calculatedAssemblyManHours ? `${calculatedAssemblyManHours} HH` : null)}
          {renderIndicator("Entregado a Cliente", formatDate(order.deliveryDate))}
        </div>

      </div>

      <Separator className="my-4" />

      {(evaluationReports.length > 0 || supplierQuotes.length > 0 || clientQuotes.length > 0 || purchaseOrderFiles.length > 0) && (
        <div className="space-y-3">
          <h4 className="flex items-center text-sm font-semibold text-muted-foreground">
            <FileArchive className="h-4 w-4 mr-2" />
            Archivos Adjuntos
          </h4>
          <Accordion type="multiple" className="w-full" defaultValue={['eval-reports', 'supplier-quotes', 'client-quotes', 'purchase-orders']}>
            {evaluationReports.length > 0 && (
              <AccordionItem value="eval-reports">
                <AccordionTrigger className="text-sm font-medium">Informes de Evaluación ({evaluationReports.length})</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pr-2 py-2">
                    {evaluationReports.map((file, index) => (
                      <div key={`eval-${index}-${file.name}`} className="flex items-center gap-2 p-2 border rounded-md bg-background text-xs">
                        {getFileIcon(file.type, "h-5 w-5 text-muted-foreground flex-shrink-0")}
                        <div className="flex-grow overflow-hidden">
                          <p className="font-medium truncate" title={file.name}>{file.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleDownload(file)} title="Descargar (simulado)">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {supplierQuotes.length > 0 && (
              <AccordionItem value="supplier-quotes">
                <AccordionTrigger className="text-sm font-medium">Presupuestos de Proveedor ({supplierQuotes.length})</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pr-2 py-2">
                    {supplierQuotes.map((file, index) => (
                      <div key={`supplier-${index}-${file.name}`} className="flex items-center gap-2 p-2 border rounded-md bg-background text-xs">
                        {getFileIcon(file.type, "h-5 w-5 text-muted-foreground flex-shrink-0")}
                        <div className="flex-grow overflow-hidden">
                          <p className="font-medium truncate" title={file.name}>{file.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleDownload(file)} title="Descargar (simulado)">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {clientQuotes.length > 0 && (
              <AccordionItem value="client-quotes">
                <AccordionTrigger className="text-sm font-medium">Presupuestos para Cliente ({clientQuotes.length})</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pr-2 py-2">
                    {clientQuotes.map((file, index) => (
                      <div key={`client-${index}-${file.name}`} className="flex items-center gap-2 p-2 border rounded-md bg-background text-xs">
                        {getFileIcon(file.type, "h-5 w-5 text-muted-foreground flex-shrink-0")}
                        <div className="flex-grow overflow-hidden">
                          <p className="font-medium truncate" title={file.name}>{file.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleDownload(file)} title="Descargar (simulado)">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
            {purchaseOrderFiles.length > 0 && (
              <AccordionItem value="purchase-orders">
                <AccordionTrigger className="text-sm font-medium">Órdenes de Compra ({purchaseOrderFiles.length})</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 pr-2 py-2">
                    {purchaseOrderFiles.map((file, index) => (
                      <div key={`po-${index}-${file.name}`} className="flex items-center gap-2 p-2 border rounded-md bg-background text-xs">
                        {getFileIcon(file.type, "h-5 w-5 text-muted-foreground flex-shrink-0")}
                        <div className="flex-grow overflow-hidden">
                          <p className="font-medium truncate" title={file.name}>{file.name}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => handleDownload(file)} title="Descargar (simulado)">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>
      )}
    </div>
  );
}

