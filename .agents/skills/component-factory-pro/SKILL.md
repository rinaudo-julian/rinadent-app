---
name: component-factory-pro
description: >
  Protocolo para la creación de componentes y vistas utilizando Next.js, TypeScript, Tailwind CSS y TanStack Query,
  priorizando la separación de lógica en hooks y el uso de componentes de UI preexistentes.
trigger: When user asks to create a component, view, or UI element in a Next.js project with shadcn/ui and TanStack Query.
---

# Skill: Component & View Creation (Next.js + TS)

## Name
component-factory-pro

## Description
Protocolo para la creación de componentes y vistas utilizando Next.js, TypeScript, Tailwind CSS y TanStack Query, priorizando la separación de lógica en hooks y el uso de componentes de UI preexistentes.

---

## Instructions

### 1. Architectural Principles
* **Separation of Concerns:** Los componentes (`.tsx`) deben enfocarse exclusivamente en la renderización y estructura visual. Toda la lógica de estado, efectos y fetching de datos debe residir en un Hook personalizado.
* **Atomic UI:** Antes de escribir clases de Tailwind personalizadas, se DEBE verificar la existencia de componentes en `shadcn/ui`. Si el componente existe, se debe importar y extender si es necesario.

### 2. Component Structure
* **Location:** Los componentes se ubican en su directorio correspondiente según el proyecto, pero su lógica asociada siempre debe buscarse en `/hooks`.
* **Clean JSX:** El componente debe ser "tonto" (presentacional). No debe contener lógica de fetching (`useQuery`) ni cálculos complejos.

### 3. Hook Pattern (The Logic Hook)
* **Naming:** Los hooks deben estar en `/hooks` y seguir la convención `use[ComponentName].ts` o un nombre funcional descriptivo. NO usar el sufijo "Logic".
* **Internal Logic:** El hook debe encapsular:
    * Llamadas a **TanStack Query** (`useQuery`, `useMutation`).
    * Estados locales de React (`useState`, `useReducer`).
    * Manejadores de eventos (Handlers).
* **Return Structure:** El hook debe devolver un objeto organizado bajo el siguiente esquema:
    ```typescript
    return {
      data: { /* resultados de queries, datos procesados */ },
      states: { /* booleanos como isOpen, isLoading, isError */ },
      methods: { /* funciones como handleSubmit, toggle, handleRefresh */ }
    };
    ```

### 4. Implementation Workflow
1.  **Identify UI:** Buscar componentes necesarios en `shadcn/ui`.
2.  **Define Hook:** Crear el hook en `/hooks` gestionando el fetch con TanStack Query y la lógica necesaria.
3.  **Assemble Component:** Importar el hook en el componente y desestructurar `data`, `states` y `methods` para mapearlos al JSX.
4.  **Styling:** Utilizar Tailwind CSS solo para el layout y ajustes finos que `shadcn/ui` no cubra.