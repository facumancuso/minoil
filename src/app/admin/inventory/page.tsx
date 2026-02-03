
'use client';

import { InventoryManagement } from "@/components/inventory/inventory-management";
import { UploadedFilesManager } from "@/components/inventory/uploaded-files-manager";
import { Separator } from "@/components/ui/separator";

export default function AdminInventoryPage() {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Gestión de Inventario
        </h1>
      </div>
      
      <InventoryManagement />

      <Separator className="my-8" />

      <UploadedFilesManager />
    </>
  );
}
