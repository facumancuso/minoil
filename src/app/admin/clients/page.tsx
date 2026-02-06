'use client';

import type { Client, WorkOrder } from '@/lib/types';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ClientTable } from '@/components/clients/client-table';
import { AddEditClientDialog } from '@/components/clients/add-edit-client-dialog';
import { DeleteClientDialog } from '@/components/clients/delete-client-dialog';
import { addOrUpdateClientAction } from '@/app/actions';
import { ClientHistoryDialog } from '@/components/clients/client-history-dialog';
import { useClients, useWorkOrders } from '@/hooks/use-data';

export default function AdminClientsPage() {
  const { data: clients, isLoading: isLoadingClients, refresh: refreshClients } = useClients();
  const { data: allWorkOrders, isLoading: isLoadingWorkOrders } = useWorkOrders();

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const clientWorkOrders = useMemo(() => {
    if (!allWorkOrders || !selectedClient?.id) return [];
    return allWorkOrders.filter(o =>
      o.clientId === selectedClient.id &&
      (o.status === 'Listo para Entregar' || o.status === 'Rechazado por Cliente') // Fixed typo 'Listo para Entrega' -> 'Entregar' based on type? Or wait, previous code said 'Listo para Entrega'. Mongoose schema Enum has 'Listo para Entregar'. I will use 'Listo para Entregar'
    );
  }, [allWorkOrders, selectedClient]);

  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { toast } = useToast();

  const handleAddNew = () => {
    setSelectedClient(null);
    setIsAddEditDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setIsAddEditDialogOpen(true);
  };

  const handleViewHistory = (client: Client) => {
    setSelectedClient(client);
    setIsHistoryDialogOpen(true);
  };

  const handleDeleteClient = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async (clientData: Client) => {
    try {
      await addOrUpdateClientAction(clientData);

      toast({
        title: clientData.id ? "Cliente Actualizado" : "Cliente Agregado",
        description: `Los datos de ${clientData.name} se han guardado.`
      });

      setIsAddEditDialogOpen(false);
      setSelectedClient(null);
      refreshClients();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la información del cliente.",
      });
    }
  };

  const handleClientDeleted = () => {
    refreshClients();
    setSelectedClient(null);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-headline text-2xl font-bold tracking-tight">
          Gestión de Clientes
        </h1>
        <Button size="sm" className="gap-1" onClick={handleAddNew}>
          <PlusCircle className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>
      <ClientTable 
        clients={clients || []} 
        onEdit={handleEdit} 
        onViewHistory={handleViewHistory}
        onDelete={handleDeleteClient}
        isLoading={isLoadingClients} 
      />

      {isAddEditDialogOpen && (
        <AddEditClientDialog
          isOpen={isAddEditDialogOpen}
          onOpenChange={setIsAddEditDialogOpen}
          onSave={handleSave}
          client={selectedClient}
        />
      )}

      {isHistoryDialogOpen && selectedClient && (
        <ClientHistoryDialog
          isOpen={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
          client={selectedClient}
          workOrders={clientWorkOrders}
          isLoading={isLoadingWorkOrders}
        />
      )}

      {isDeleteDialogOpen && selectedClient && (
        <DeleteClientDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          client={selectedClient}
          onClientDeleted={handleClientDeleted}
        />
      )}
    </>
  );
}
