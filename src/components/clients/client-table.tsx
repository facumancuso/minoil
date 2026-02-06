
"use client";

import { useState } from 'react';
import type { Client } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle, Edit, History, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '../ui/skeleton';

type ClientTableProps = {
  clients: Client[];
  onEdit: (client: Client) => void;
  onViewHistory: (client: Client) => void;
  onDelete: (client: Client) => void;
  isLoading?: boolean;
};

export function ClientTable({ clients, onEdit, onViewHistory, onDelete, isLoading = false }: ClientTableProps) {
  const [filter, setFilter] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(filter.toLowerCase()) ||
    (client.contactPerson && client.contactPerson.toLowerCase().includes(filter.toLowerCase())) ||
    client.email.toLowerCase().includes(filter.toLowerCase())
  );
  
  const handleAction = (type: 'call' | 'whatsapp' | 'email', value: string) => {
    let url = '';
    if (type === 'call') url = `tel:${value}`;
    if (type === 'whatsapp') url = `https://wa.me/${value.replace(/\D/g, '')}`;
    if (type === 'email') url = `mailto:${value}`;
    window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Clientes</CardTitle>
        <CardDescription>Directorio de clientes y contactos principales.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Buscar por nombre, contacto o email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.contactPerson}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                         <Button variant="ghost" size="icon" title="Ver Historial" onClick={() => onViewHistory(client)}>
                              <History className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" title="Llamar" onClick={() => handleAction('call', client.phone)}>
                              <Phone className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" title="Enviar WhatsApp" onClick={() => handleAction('whatsapp', client.phone)}>
                              <MessageCircle className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" title="Enviar Email" onClick={() => handleAction('email', client.email)}>
                              <Mail className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" title="Editar" onClick={() => onEdit(client)}>
                              <Edit className="h-4 w-4" />
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           title="Eliminar" 
                           onClick={() => onDelete(client)}
                           className="text-destructive hover:text-destructive hover:bg-destructive/10"
                         >
                              <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
