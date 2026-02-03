"use client";

import { useState, useEffect, useCallback } from "react";
import { getWorkOrdersAction, getClientsAction, getInventoryAction, getToolsAction } from "@/app/actions";
import { WorkOrder, Client, InventoryItem, Tool } from "@/lib/types";

export function useWorkOrders() {
    const [data, setData] = useState<WorkOrder[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setIsLoading(true);
            const orders = await getWorkOrdersAction();
            setData(orders);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch orders'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        // Optional: Polling
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, [fetchOrders]);

    return { data, isLoading, error, refresh: fetchOrders };
}

export function useClients() {
    const [data, setData] = useState<Client[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchClients = useCallback(async () => {
        try {
            setIsLoading(true);
            const clients = await getClientsAction();
            setData(clients);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch clients'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    return { data, isLoading, error, refresh: fetchClients };
}

export function useInventory() {
    const [data, setData] = useState<InventoryItem[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchInventory = useCallback(async () => {
        try {
            setIsLoading(true);
            const items = await getInventoryAction();
            setData(items);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch inventory'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    return { data, isLoading, error, refresh: fetchInventory };
}

export function useTools() {
    const [data, setData] = useState<Tool[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchTools = useCallback(async () => {
        try {
            setIsLoading(true);
            const tools = await getToolsAction();
            setData(tools);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch tools'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTools();
    }, [fetchTools]);

    return { data, isLoading, error, refresh: fetchTools };
}
