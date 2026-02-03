# Minoil Central - Resumen Técnico y Funcional

## 1. Visión General del Proyecto

**Minoil Central** es una aplicación web integral diseñada para la gestión de operaciones y órdenes de trabajo (OT) en un taller de reparación de componentes para la industria minera. La plataforma ofrece un dashboard centralizado que permite a diferentes roles de usuario (desde gerentes hasta técnicos) supervisar, gestionar y analizar el ciclo de vida completo de una reparación.

### 1.1. Propósito

El objetivo principal es digitalizar y centralizar el seguimiento de las órdenes de trabajo, reemplazando procesos manuales o descentralizados. Esto proporciona una visibilidad en tiempo real del estado de las operaciones, mejora la planificación y permite un análisis de datos para la toma de decisiones estratégicas.

### 1.2. Características Principales

- **Dashboard por Roles:** Vistas personalizadas según el rol del usuario (Admin, Gerente, Compras, etc.).
- **Gestión de Órdenes de Trabajo:** Creación, actualización y seguimiento detallado de cada OT a través de sus distintas etapas.
- **Visualización de Datos:** KPIs (Indicadores Clave de Rendimiento), gráficos de tendencias, distribución de componentes y análisis de servicios.
- **Gestión de Clientes:** Directorio de clientes con historial de reparaciones y datos de contacto.
- **Planificación Visual (Gantt):** Un diagrama de Gantt interactivo para planificar y visualizar la carga de trabajo en el tiempo.
- **Gestión de Inventario:** Módulo para el seguimiento de repuestos y herramientas.
- **Autenticación Simulada:** Un sistema de inicio de sesión basado en roles para simular el acceso de diferentes perfiles de usuario.

---

## 2. Pila Tecnológica (Tech Stack)

- **Framework:** **Next.js 15+** con App Router.
- **Lenguaje:** **TypeScript**.
- **UI y Componentes:** **ShadCN/UI** para un conjunto de componentes reutilizables y accesibles.
- **Estilismo:** **Tailwind CSS** para un diseño rápido y personalizable basado en utilidades.
- **Estado Global:** **React Context API** (`useAuth`) para la gestión del estado de autenticación del usuario. El estado local se gestiona con `useState` y `useMemo`.
- **Formularios:** **React Hook Form** con **Zod** para la validación de esquemas.
- **Gráficos y Visualizaciones:** **Recharts** para la creación de gráficos interactivos.
- **Iconos:** **Lucide React** para un conjunto de iconos limpio y consistente.
- **Base de Datos y Autenticación:** Actualmente, la aplicación utiliza una **simulación en memoria (mock)**. Los datos se obtienen de `src/lib/data.ts` y se mantienen en el estado del cliente durante la sesión. Esto está diseñado para una migración sencilla a **Firebase (Firestore y Auth)**.

---

## 3. Flujo de Trabajo y Lógica de la Aplicación

### 3.1. Autenticación y Roles

1.  **Página de Inicio (`/login`):** El usuario inicia en esta página. Se le presenta una lista de perfiles de usuario de ejemplo (Admin, Gerente de Taller, etc.).
2.  **Simulación de Login:** Al seleccionar un perfil, el hook `useAuth` (`src/context/auth-context.tsx`) guarda el perfil del usuario en el `localStorage` del navegador. Esto simula una sesión persistente.
3.  **Redirección:**
    -   La página raíz (`/`) y la página `/home` contienen lógica en un `useEffect` que verifica el estado de `loading` y el `profile` del `useAuth`.
    -   Si el usuario no está "logueado", se le redirige a `/login`.
    -   Si el usuario está logueado y su rol es `Admin`, se le redirige a `/admin`.
    -   Si es un usuario normal, permanece en `/home` para ver su dashboard.
4.  **Protección de Rutas:** El layout de administración (`/admin/layout.tsx`) protege las rutas anidadas, verificando que solo los roles autorizados (Admin, Gerentes, etc.) puedan acceder.

### 3.2. Gestión de Datos (Simulada)

- **Fuente de Datos:** El archivo `src/lib/data.ts` actúa como la base de datos en memoria. Exporta funciones como `getWorkOrders()`, `getClients()`, `addWorkOrder()`, `updateWorkOrder()`, etc.
- **Lectura:** Los componentes que necesitan datos (ej. `src/app/admin/work-orders/page.tsx`) llaman a estas funciones al renderizarse y guardan los datos en su estado local (`useState`).
- **Escritura y Actualización:**
    1.  El usuario interactúa con un componente (ej. un formulario en un diálogo).
    2.  Al guardar, se llama a una **Server Action** definida en `src/app/actions.ts`.
    3.  La Server Action invoca la función correspondiente de `src/lib/data.ts` (ej. `dbUpdateWorkOrder`).
    4.  La función de `data.ts` modifica el array de datos en memoria.
    5.  La Server Action llama a `revalidatePath('/')` para instruir a Next.js que necesita refrescar los datos en las rutas afectadas, provocando una nueva renderización con los datos actualizados.

---

## 4. Estructura del Proyecto y Componentes Clave

-   **/src/app/**
    -   `layout.tsx`: Layout raíz. Importa las fuentes y envuelve la aplicación en el `AuthProvider`.
    -   `globals.css`: Estilos globales y variables de tema de ShadCN/Tailwind.
    -   `/login/page.tsx`: Página de inicio de sesión con selección de perfiles.
    -   `/home/page.tsx`: Dashboard para usuarios no administradores.
    -   **/admin/**
        -   `layout.tsx`: Layout principal para el panel de administración. Incluye la navegación por pestañas (`Tabs`) y la lógica de protección de rutas por rol.
        -   `/work-orders/page.tsx`: Muestra la tabla de órdenes de trabajo activas (`RecentOrdersTable`).
        -   `/clients/page.tsx`: Muestra la tabla de clientes (`ClientTable`) y gestiona los diálogos para añadir/editar clientes.
        -   `/gantt/page.tsx`: Contiene el componente `InteractiveGanttChart`.
        -   `/statistics/page.tsx`: Dashboard de métricas para el administrador.
        -   ...otras páginas administrativas.

-   **/src/components/**
    -   **/dashboard/**: Componentes para los paneles de métricas.
        -   `recent-orders-table.tsx`: Componente central y más complejo. Muestra la tabla de OTs, maneja la paginación, filtros, ordenación, y el menú de acciones para cada fila. Contiene la lógica para abrir diálogos de actualización, edición e historial.
        -   `kpi-card.tsx`: Tarjetas para los indicadores clave.
        -   `order-trends-chart.tsx`: Gráfico de líneas (Recharts) que muestra la tendencia de OTs.
    -   **/work-order/**: Componentes relacionados con la gestión de una OT.
        -   `add-order-dialog.tsx`: Formulario modal para crear una nueva OT.
        -   `update-order-dialog.tsx`: Formulario modal para cambiar el estado de una OT y añadir notas. Contiene campos condicionales según la etapa.
        -   `quotation-dialog.tsx`: Editor de cotizaciones con capacidad de impresión.
        -   `view-order-history-dialog.tsx`: Muestra el historial de notas y permite imprimir/descargar la ficha técnica.
        -   `printable-work-order.tsx`: Componente con formato de impresión para la ficha de la OT.
    -   **/clients/**: Componentes para la gestión de clientes.
        -   `client-table.tsx`: Tabla que muestra el listado de clientes.
        -   `add-edit-client-dialog.tsx`: Formulario para añadir o editar un cliente.
    -   **/gantt/**:
        -   `gantt-chart.tsx`: Implementación del diagrama de Gantt interactivo.
    -   **/ui/**: Componentes base de ShadCN UI (Button, Card, Dialog, etc.).

-   **/src/lib/**
    -   `data.ts`: Base de datos simulada. Contiene los arrays de datos y las funciones para manipularlos.
    -   `types.ts`: Define todas las interfaces de TypeScript para los modelos de datos (WorkOrder, Client, Status, etc.).
    -   `utils.ts`: Funciones de utilidad, como `cn` para fusionar clases de Tailwind.
    -   `seed-users.ts`: Define los perfiles de usuario de ejemplo.

-   **/src/context/**
    -   `auth-context.tsx`: Hook `useAuth` y proveedor `AuthProvider` que gestiona la sesión de usuario simulada usando `localStorage`.

-   **/src/app/actions.ts**:
    -   Contiene las Server Actions (`addWorkOrderAction`, `updateWorkOrderAction`) que son llamadas desde el cliente para modificar los datos en el "servidor" (en este caso, el mock en `data.ts`).

---

## 5. Cómo Replicar el Proyecto

1.  **Copiar Estructura:** Copia toda la estructura de archivos y carpetas del proyecto.
2.  **Instalar Dependencias:** Ejecuta `npm install` para instalar todas las dependencias listadas en `package.json`.
3.  **Revisar `data.ts`:** Este archivo es el corazón de la lógica de negocio simulada. Entender cómo se manipulan los arrays `workOrders` y `CLIENTS` es clave.
4.  **Flujo de Autenticación:** Comienza por analizar `login/page.tsx` y `auth-context.tsx` para entender cómo se simula el inicio de sesión.
5.  **Componente Principal (`RecentOrdersTable`):** Estudia este componente para ver cómo se visualizan los datos y cómo las interacciones del usuario (clics en botones) disparan la apertura de diálogos.
6.  **Interacción Cliente-Servidor (Server Actions):** Sigue el flujo desde un formulario (ej. `UpdateOrderDialog`) hasta la Server Action en `actions.ts` y finalmente hasta la función de manipulación de datos en `data.ts`. Observa cómo `revalidatePath` actualiza la UI.
7.  **Migración a Firebase (Paso Futuro):**
    -   Reemplaza el `AuthProvider` con un proveedor de Firebase real que use `onAuthStateChanged`.
    -   Reemplaza las funciones en `data.ts` con llamadas a Firestore (ej. `getDocs`, `addDoc`, `updateDoc`).
    -   Los componentes que usan `useState` para los datos (`getWorkOrders()`) deberían ser refactorizados para usar un hook como `useCollection` que escuche los cambios de Firestore en tiempo real.
    -   Las Server Actions se mantendrían, pero en lugar de llamar a `data.ts`, llamarían a funciones del SDK de Admin de Firebase para interactuar con Firestore.

Este documento debería proporcionar una base sólida para entender, mantener y expandir la aplicación Minoil Central.