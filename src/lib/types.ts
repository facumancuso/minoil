

export type Status =
  | 'Espera de Desarme y Evaluación'
  | 'Desarme y Evaluación'
  | 'Simulacion'
  | 'Cotizacion'
  | 'Cotizacion al cliente'
  | 'Espera de repuesto'
  | 'Llegada de Repuesto'
  | 'Rechazado por Cliente'
  | 'Armado'
  | 'Listo para Entregar'
  | 'Entregado'
  | 'Espera de Retiro'; // Mantener por retrocompatibilidad, pero no usar para nuevos flujos

export type UserRole =
  | 'Admin'
  | 'Gerente de Taller'
  | 'Responsable de Compras'
  | 'Gerente Técnico'
  | 'Gerente'
  | 'Director'
  | 'Pruebas';

export type ComponentType = string;
export type Brand = string;
export type SerialNumber = string;

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export type Equipment = 'CAT 793F' | 'Komatsu 930E' | 'Liebherr T 282C' | 'Hitachi EH5000AC-3' | 'BelAZ 75710';

export type WorkOrderNote = {
  status: Status;
  note: string;
  timestamp: Date;
  user: string;
};

export type SparePart = {
  id: string;
  description: string;
  quantity: number;
  status: 'Pendiente' | 'Ordenado' | 'Recibido';
};

export type EvaluationReport = {
  name: string;
  type: string;
  size: number;
};

export interface WorkOrder {
  id: string; // MongoDB unique ID
  orderNumber: string; // Custom work order number (e.g., OT-12345)
  client: string;
  clientId: string; // ID del cliente
  component: ComponentType;
  brand: Brand;
  serialNumber: SerialNumber;
  equipment: Equipment | string; // Allow string for new entries
  workOrderType: 'Normal' | 'Garantía';
  status: Status;
  progress: number;
  createdAt: Date;
  notes?: WorkOrderNote[];
  spareParts?: SparePart[];
  evaluationReports?: EvaluationReport[];
  supplierQuotes?: EvaluationReport[];
  clientQuotes?: EvaluationReport[];
  purchaseOrderFiles?: EvaluationReport[];

  solped?: string;
  purchaseOrder?: string;

  // Fechas de seguimiento
  estimatedEvaluationStartDate?: Date;
  evaluationStartDate?: Date;
  evaluationEndDate?: Date;
  evaluationEstimatedEndDate?: Date;
  supplierQuotationDate?: Date;
  clientQuotationDate?: Date;
  clientQuotationApprovalDate?: Date; // Fecha de aprobacion de cotizacion del cliente
  estimatedDeliveryDate?: Date; // fecha estimada de entrega al cliente

  sparePartsEstimatedArrivalDate?: Date; // fecha estimada de llegada de repuesto
  sparePartsArrivalDate?: Date; // fecha real de llegada de repuesto

  assemblyStartDate?: Date;
  assemblyEstimatedEndDate?: Date;
  assemblyEndDate?: Date;
  deliveryDate?: Date;

  // Tiempos de ciclo y datos manuales
  evaluationWaitTimeDays?: number;
  evaluationTimeDays?: number;
  evaluationMechanics?: number;
  evaluationManHours?: number;

  assemblyMechanics?: number;
  assemblyManHours?: number;

  assemblyTimeHours?: number;
  deliveryComplianceDelta?: number;

  // Decisiones y Flags
  isViableForRepair?: boolean;
  isStockUsage?: boolean;
  partsArrivalComplete?: boolean;
}


export interface Kpi {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export type ComponentDistribution = {
  name: string;
  value: number;
}[];

export type OrderTrend = {
  month: string;
  'Order Count': number;
}[];

export type ServiceInsight = {
  name: string;
  count: number;
  avgTime: string;
}

export type TestBenchSpecification = {
  name: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type TestBenchStatus = {
  status: 'Available' | 'In Use' | 'Under Maintenance';
  specifications: TestBenchSpecification[];
}

export type AiInsight = {
  orderTrends?: string;
  suggestedVisualizations?: string[];
  reasoning?: string;
}

// Mock User Types
export interface UserProfile {
  email: string;
  role: UserRole;
}

export interface MockUser {
  uid: string;
  email: string;
}

// User Task Observation Types
export interface Task {
  id: string;
  title: string;
  orderId: string;
  status: 'Pendiente' | 'En Progreso' | 'Completada' | 'Bloqueada';
  dueDate: Date;
}

export interface UserTask {
  user: UserProfile;
  tasks: Task[];
}

// Inventory Types
export interface InventoryItem {
  id: string;
  code: string;
  description: string;
  quantity: number;
  location: string;
  unitPrice?: number;
}

export interface Tool {
  id: string;
  code: string;
  description: string;
  status: 'Disponible' | 'En Uso' | 'En Mantenimiento';
  assignedTo?: string;
}
