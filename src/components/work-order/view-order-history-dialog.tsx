
"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WorkOrder } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { PrintableWorkOrder } from "./printable-work-order";

type ViewOrderHistoryDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: WorkOrder;
};

export function ViewOrderHistoryDialog({ isOpen, onOpenChange, order }: ViewOrderHistoryDialogProps) {
  const sortedNotes = order.notes?.sort((a, b) => {
    const dateA = a.timestamp.seconds ? new Date(a.timestamp.seconds * 1000) : new Date(a.timestamp);
    const dateB = b.timestamp.seconds ? new Date(b.timestamp.seconds * 1000) : new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime();
  }) || [];

  const componentToPrintRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
    documentTitle: `OT-${order.id}-${format(new Date(), "yyyyMMdd")}`,
  });

  const getNoteDate = (timestamp: any) => {
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000);
    }
    return new Date(timestamp);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Historial y Ficha (OT: {order.id})</DialogTitle>
          <DialogDescription>
            Un registro cronológico de todas las actualizaciones y la opción de imprimir la ficha técnica.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-6">
            <div className="space-y-6">
                {sortedNotes.length > 0 ? (
                sortedNotes.map((note, index) => (
                    <div key={index} className="flex flex-col gap-1 border-l-2 pl-4">
                        <p className="text-sm font-semibold">{note.status}</p>
                        <p className="text-sm text-muted-foreground">{note.note}</p>
                        <p className="text-xs text-muted-foreground/70">
                            {note.user} &bull; {format(getNoteDate(note.timestamp), "dd/MM/yyyy HH:mm", { locale: es })}
                        </p>
                    </div>
                ))
                ) : (
                <p className="text-sm text-muted-foreground text-center py-8">No hay historial de notas para esta orden.</p>
                )}
            </div>
        </ScrollArea>
        <DialogFooter>
           <Button onClick={handlePrint} variant="outline" className="w-full">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Ficha Técnica
            </Button>
        </DialogFooter>
        <div className="absolute -left-[9999px] top-0">
            <PrintableWorkOrder ref={componentToPrintRef} order={order} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
