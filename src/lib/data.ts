
import type { WorkOrder, Client, UserTask } from './types';

// This file is now for mock data and types, not for Firebase interaction.
// Firebase interactions are handled in components or Server Actions.

const MOCK_WORK_ORDERS: WorkOrder[] = [];
const MOCK_CLIENTS: Client[] = [];
const MOCK_USER_TASKS: UserTask[] = [];

export const getWorkOrders = (): WorkOrder[] => {
  return MOCK_WORK_ORDERS;
};

export const getClients = (): Client[] => {
    return MOCK_CLIENTS;
};

export const getUserTasks = (): UserTask[] => {
    return MOCK_USER_TASKS;
}
