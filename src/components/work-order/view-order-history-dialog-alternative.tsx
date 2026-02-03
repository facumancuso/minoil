
"use client";

import React, { useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
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
import { Download, Loader2 } from "lucide-react";
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
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleDownload = async () => {
    if (!componentToPrintRef.current) return;
    
    setIsGenerating(true);

    try {
        await new Promise(resolve => setTimeout(resolve, 200));

        const canvas = await html2canvas(componentToPrintRef.current, {
            scale: 2, 
            useCORS: true,
            backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        const imgWidth = pdfWidth;
        const imgHeight = imgWidth / ratio;
        
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }
        
        pdf.save(`OT-${order.id}-${format(new Date(), "yyyyMMdd")}.pdf`);

    } catch (error) {
        console.error("Error generating PDF", error);
    } finally {
        setIsGenerating(false);
    }
  };

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
            Un registro cronológico de todas las actualizaciones y la opción de descargar la ficha técnica.
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
           <Button onClick={handleDownload} disabled={isGenerating} variant="outline" className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Ficha como PDF
                </>
              )}
            </Button>
        </DialogFooter>
        <div className="absolute -left-[9999px] top-0">
            <PrintableWorkOrder ref={componentToPrintRef} order={order} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
