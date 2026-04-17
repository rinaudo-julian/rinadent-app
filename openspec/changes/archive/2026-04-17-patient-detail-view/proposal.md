# Proposal: Patient Detail View

## Intent
Crear la vista de detalle de paciente en `/patients/[id]` con tabs funcionales para centralizar acceso a información clínica del paciente.

## Scope

### In Scope
- Ruta dinámica `/patients/[id]`
- Redirección desde acción lápiz en tabla de pacientes
- Tabs: Historial Médico, Odontograma, Estudios, Tratamientos
- Historial Médico: estado vacío + creación por dialog + visualización de datos
- APIs para obtener paciente y medical history
- Hooks y validación de formulario con Zod

### Out of Scope (esta iteración)
- CRUD completo para Odontograma, Estudios y Tratamientos
- Edición y eliminación de historial médico

## Success Criteria
- El lápiz navega a `/patients/[id]`
- El título muestra nombre y apellido del paciente
- Tabs funcionales con render por sección
- Tabs no médicas muestran solo título
- Historial médico muestra estado vacío + CTA y permite crear/visualizar
