
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Client, WorkOrder } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Skeleton } from "../ui/skeleton";

type ClientHistoryDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  client: Client;
  workOrders: WorkOrder[];
  isLoading: boolean;
};

export function ClientHistoryDialog({ isOpen, onOpenChange, client, workOrders, isLoading }: ClientHistoryDialogProps) {
    
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Historial de Reparaciones: {client.name}</DialogTitle>
          <DialogDescription>
            Listado de todos los componentes reparados para este cliente.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            ) : workOrders.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>N° OT</TableHead>
                            <TableHead>Componente</TableHead>
                            <TableHead>Equipo</TableHead>
                            <TableHead className="text-right">Fecha Finalización</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {workOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.orderNumber}</TableCell>
                                <TableCell>{order.component}</TableCell>
                                <TableCell>{order.equipment}</TableCell>
                                <TableCell className="text-right">
                                    {order.deliveryDate ? format(new Date(order.deliveryDate), 'dd/MM/yyyy', {locale: es}) : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>No hay órdenes de trabajo completadas para este cliente.</p>
                </div>
            )}

        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
