# Technical Design - Dental Practice Management System

---

## 1. Supabase SQL Schema

```sql
-- schema.sql (Supabase PostgreSQL)

-- ============================================================================
-- ENUMS (all in English)
-- ============================================================================

CREATE TYPE condition_coverage AS ENUM ('health_insurance', 'private');

CREATE TYPE gender AS ENUM ('male', 'female', 'other');

CREATE TYPE oncological_treatment AS ENUM ('completed', 'ongoing', 'none');

CREATE TYPE lab_result_status AS ENUM ('none', 'normal', 'altered');

CREATE TYPE study_type AS ENUM ('radiography', 'tomography', 'photography');

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  street TEXT NOT NULL,
  street_number TEXT NOT NULL,
  locality TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  gender gender NOT NULL,
  condition_coverage condition_coverage NOT NULL,
  phone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  
  allergies INTEGER NOT NULL CHECK (allergies IN (0,1)),
  heart_condition INTEGER NOT NULL CHECK (heart_condition IN (0,1)),
  diabetes INTEGER NOT NULL CHECK (diabetes IN (0,1)),
  hypertension INTEGER NOT NULL CHECK (hypertension IN (0,1)),
  anticoagulation INTEGER NOT NULL CHECK (anticoagulation IN (0,1)),
  bisphosphonates INTEGER NOT NULL CHECK (bisphosphonates IN (0,1)),
  osteoporosis INTEGER NOT NULL CHECK (osteoporosis IN (0,1)),
  hemophilia INTEGER NOT NULL CHECK (hemophilia IN (0,1)),
  covid INTEGER NOT NULL CHECK (covid IN (0,1)),
  covid_observation TEXT,
  bone_density_studies INTEGER NOT NULL CHECK (bone_density_studies IN (0,1)),
  
  -- Text fields
  medications TEXT,
  
  -- Enums
  oncological_treatment oncological_treatment NOT NULL,
  previous_lab_results lab_result_status NOT NULL,
  current_lab_results lab_result_status NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type study_type NOT NULL,
  file_url TEXT NOT NULL,
  study_date DATE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE odontograms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teeth JSONB NOT NULL,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  patient_id UUID UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE patient_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(patient_id, treatment_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_patients_active ON patients(is_active) WHERE is_active = true;
CREATE INDEX idx_studies_patient ON studies(patient_id);
CREATE INDEX idx_studies_date ON studies(study_date);
CREATE INDEX idx_patient_treatments_patient ON patient_treatments(patient_id);
```

### Schema Notes

1. **Odontograma as JSONB**: The `teeth` field stores a JSONB object with all 32 teeth:
   ```json
   {
     "1": { "status": "caries", "face": "distal", "color": "blue" },
     "2": { "status": "restored", "color": "red" },
     "3": { "status": "missing" },
     ...
   }
   ```

2. **Soft delete**: The `isActive` field in patients table hides patients from the active list.

3. **Age calculation**: Not stored, calculated at runtime from `date_of_birth`.

4. **UUIDs**: All IDs use UUID for security and distribution.

5. **Accounting removed**: Module will be designed later with better planning.

6. **No ORM**: Using Supabase JS Client directly.

---

## 2. React Component Architecture

### Components Structure

```
src/components/
├── ui/                          # shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── table.tsx
│   ├── label.tsx
│   ├── textarea.tsx
│   └── ...
│
├── layout/                      # Layout components
│   ├── Sidebar.tsx             # Navigation sidebar
│   ├── Header.tsx              # Top header with user info
│   ├── PageHeader.tsx          # Page title + actions
│   └── DashboardLayout.tsx     # Main layout wrapper
│
├── patients/                   # Patient module components
│   ├── PatientForm.tsx        # Create/edit patient form
│   ├── PatientCard.tsx        # Patient summary card
│   ├── PatientList.tsx        # Table of patients
│   ├── PatientSearch.tsx      # Search input
│   └── PatientDetail.tsx      # Patient detail page wrapper
│
├── medical-history/            # Medical history components
│   ├── MedicalHistoryForm.tsx
│   ├── BooleanField.tsx       # Yes/No toggle
│   ├── CovidField.tsx          # Conditional field
│   └── SelectField.tsx        # Enum selector
│
├── studies/                   # Studies module components
│   ├── StudyUploader.tsx      # File upload + date
│   ├── StudyList.tsx          # Chronological list
│   ├── StudyViewer.tsx        # Image modal viewer
│   └── StudyCard.tsx          # Study preview card
│
├── odontogram/                 # Odontogram components
│   ├── OdontogramGrid.tsx     # 32-tooth grid layout
│   ├── Tooth.tsx              # Individual tooth component
│   ├── ToothEditor.tsx        # Modal to edit tooth state
│   ├── OdontogramLegend.tsx   # Color/mark legend
│   └── OdontogramState.ts     # Type definitions
│
├── treatments/                # Treatments module
│   ├── TreatmentCatalog.tsx   # List of available treatments
│   ├── TreatmentForm.tsx      # Add treatment to patient
│   ├── TreatmentList.tsx     # Patient's treatments
│   └── TreatmentSelector.tsx  # Searchable dropdown
│
└── shared/                    # Shared utilities
    ├── LoadingSpinner.tsx
    ├── ErrorMessage.tsx
    ├── EmptyState.tsx
    ├── ConfirmDialog.tsx
    └── DatePicker.tsx
```

### Component Patterns

- **Container/Presentational**: Separate logic from presentation
- **Compound Components**: For odontogram (Grid > Tooth > Editor)
- **Hook-based**: Business logic in custom hooks

---

## 3. Custom Hooks

```typescript
// src/hooks/usePatient.ts
export function usePatient(id: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['patient', id],
    queryFn: () => patientService.getById(id)
  })
  
  const update = useMutation({
    mutationFn: patientService.update,
    onSuccess: () => refetch()
  })
  
  return { patient: data, isLoading, error, update, refetch }
}

// src/hooks/usePatients.ts (list)
export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: patientService.getAll
  })
}

// src/hooks/useMedicalHistory.ts
export function useMedicalHistory(patientId: string) { ... }

// src/hooks/useStudies.ts
export function useStudies(patientId: string) { ... }

// src/hooks/useOdontogram.ts
export function useOdontogram(patientId: string) { ... }

// src/hooks/useTreatments.ts
export function useTreatments(patientId: string) { ... }
```

---

## 4. API Routes (Next.js Route Handlers)

### Patients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients` | List all active patients |
| `GET` | `/api/patients/[id]` | Get patient by ID |
| `POST` | `/api/patients` | Create new patient |
| `PUT` | `/api/patients/[id]` | Update patient (full replacement) |
| `DELETE` | `/api/patients/[id]` | Soft delete (set isActive = false) |

### Medical History

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients/[id]/medical-history` | Get patient's medical history |
| `POST` | `/api/patients/[id]/medical-history` | Create medical history for patient |
| `PUT` | `/api/patients/[id]/medical-history` | Update medical history |

### Studies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients/[id]/studies` | List patient's studies (ordered by date) |
| `POST` | `/api/patients/[id]/studies` | Upload and register new study |
| `DELETE` | `/api/studies/[id]` | Delete study (and file) |

### Odontogram

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients/[id]/odontogram` | Get patient's odontogram |
| `POST` | `/api/patients/[id]/odontogram` | Create odontogram for patient |
| `PUT` | `/api/patients/[id]/odontogram` | Update odontogram |

### Treatments (Catalog)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/treatments` | List all active treatments |
| `POST` | `/api/treatments` | Create new treatment |
| `PUT` | `/api/treatments/[id]` | Update treatment |
| `DELETE` | `/api/treatments/[id]` | Soft delete |

### Patient Treatments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/patients/[id]/treatments` | List treatments for patient |
| `POST` | `/api/patients/[id]/treatments` | Add treatment to patient |
| `DELETE` | `/api/patient-treatments/[id]` | Remove treatment from patient |

### Storage (Presigned URLs)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/storage/upload` | Get presigned URL for upload |
| `DELETE` | `/api/storage/[fileKey]` | Delete file from storage |

**Note**: Files are retrieved via `fileUrl` field in Study model (public URL from Supabase Storage).

---

## 5. Main Views Wireframes

### 5.1 Login Page (`/`)

```
┌─────────────────────────────────────────┐
│                                         │
│         🦷 RINADENT                     │
│    Sistema de Gestión Odontológica      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Email                           │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ Contraseña                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         INICIAR SESIÓN         │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

### 5.2 Dashboard / Patients List (`/patients`)

```
┌──────────────────────────────────────────────────────────┐
│  🦷 RINADENT              Dr. Juan [Cerrar sesión]      │
├────────────┬─────────────────────────────────────────────┤
│            │                                             │
│  Pacientes │  🔍 Buscar paciente...        [+ Nuevo]    │
│  ─────────│  ┌─────┬────────┬──────┬────────┬────────┐  │
│  Catálogo  │  │ #   │ Nombre │ Tel  │ Cobertura│ Acciones│  │
│            │  ├─────┼────────┼──────┼────────┼────────┤  │
│            │  │ 1   │ Pérez  │ 4545 │ Particular│ 👁 ✏️ 🗑│  │
│            │  │ 2   │ Gómez  │ 3434 │ OS XX   │ 👁 ✏️ 🗑│  │
│            │  └─────┴────────┴──────┴────────┴────────┘  │
│            │                                             │
│            │  Mostrando 2 pacientes                      │
└────────────┴─────────────────────────────────────────────┘
```

---

### 5.3 Patient Detail (`/patients/[id]`)

```
┌──────────────────────────────────────────────────────────┐
│  🦷 RINADENT  ← Volver  |  Paciente: Juan Pérez         │
├────────────┬─────────────────────────────────────────────┤
│            │  ┌────────────────────────────────────┐    │
│  Ficha     │  │ DATOS PERSONALES                   │    │
│  ─────────│  │ ──────────────────────────────────  │    │
│  Antece-   │  │ Nombre: Juan Pérez                 │    │
│  dentes    │  │ Fecha nac.: 15/03/1985 (39 años)   │    │
│            │  │ Tel: 11-4545-4545                  │    │
│  Estudios  │  │ Dirección: Calle 123, Localidad    │    │
│            │  │ Cobertura: Particular              │    │
│  Odonto-   │  └────────────────────────────────────┘    │
│  grama     │                                             │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  Trata-    │  │ Antece-  │ │Estudios │ │Odonto-  │   │
│  mientos   │  │ dentes   │ │   (3)   │ │ grama   │   │
│            │  └──────────┘ └──────────┘ │  ✓     │   │
│            │                              └──────────┘   │
│            │  ┌──────────┐                               │
│            │  │Trata-    │                               │
│            │  │mientos   │                               │
│            │  │  (5)     │                               │
│            │  └──────────┘                               │
└────────────┴─────────────────────────────────────────────┘
```

---

### 5.4 Medical History Form (`/patients/[id]/medical-history`)

```
┌──────────────────────────────────────────────────────────┐
│  ← Volver a Ficha  |  Antecedentes Médicos              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Marque SI o NO para cada antecedente:                   │
│                                                          │
│  ┌────────────────────────────────┐  ┌────────────────┐  │
│  │ Alergias                      │  │ ● Sí  ○ No    │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ Condición cardíaca            │  │ ○ Sí  ● No    │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ Diabetes                      │  │ ● Sí  ○ No    │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ Hipertensión                  │  │ ○ Sí  ● No    │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ Anticoagulación               │  │ ○ Sí  ● No    │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ Consumo de bifosfonato        │  │ ○ Sí  ● No    │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ Osteoporosis                  │  │ ○ Sí  ● No    │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ Hemofilia                     │  │ ○ Sí  ● No    │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ COVID-19                      │  │ ● Sí  ○ No    │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ Observación COVID (si Sí):   │  │ [____________] │  │
│  ├────────────────────────────────┤  ├────────────────┤  │
│  │ Estudios previos densidad    │  │ ○ Sí  ● No    │  │
│  │ ósea                         │  │                │  │
│  └────────────────────────────────┘  └────────────────┘  │
│                                                          │
│  Tratamiento oncológico:  [ Cursó ▼ ]                   │
│  Análisis laboratorio previos:  [ Normales ▼ ]         │
│  Análisis laboratorio actuales:  [ No ▼ ]              │
│                                                          │
│  Medicación habitual:                                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │                                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              GUARDAR ANTECEDENTES                │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

### 5.5 Studies List (`/patients/[id]/studies`)

```
┌──────────────────────────────────────────────────────────┐
│  ← Volver a Ficha  |  Estudios e Imágenes              │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Agregar Estudio]                                     │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 📷 15/04/2024 - Radiografía                     │   │
│  │    [Ver] [Eliminar]                              │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 📷 10/03/2024 - Fotografía                       │   │
│  │    [Ver] [Eliminar]                              │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 📷 05/02/2024 - Tomografía                       │   │
│  │    [Ver] [Eliminar]                              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Modal Agregar Estudio:**
```
┌────────────────────────────────────────┐
│  Agregar Estudio                      │
│                                        │
│  Tipo: [Radiografía ▼]                │
│                                        │
│  Fecha del estudio: [15/04/2024]      │
│                                        │
│  Archivo: [Seleccionar archivo]       │
│  ┌────────────────────────────────┐   │
│  │ 📁 radiografia_paciente.jpg   │   │
│  └────────────────────────────────┘   │
│                                        │
│  [Cancelar]  [Subir y guardar]        │
└────────────────────────────────────────┘
```

---

### 5.6 Odontogram (`/patients/[id]/odontogram`)

```
┌──────────────────────────────────────────────────────────┐
│  ← Volver a Ficha  |  Odontograma                       │
│  Última actualización: 15/04/2024                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  LEYENDA:                                                │
│  🔵 Azul = Pendiente  🔴 Rojo = Realizado  🟢 Verde = sano│
│  ✖ azul = Extraer   ✖ roja = Falta                       │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │   18  17  16  15  14  13  12  11 │ 21  22  23  24 │  │
│  │  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐ │┌──┐┌──┐┌──┐┌──┐│  │
│  │  │██││▒▒││  ││██││  ││  ││  ││  │ ││  ││  ││  ││  ││  │
│  │  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘ └──┘└──┘└──┘└──┘│  │
│  │                                                  │  │
│  │  ┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐┌──┐ │┌──┐┌──┐┌──┐┌──┐│  │
│  │  │▒▒││  ││  ││  ││  ││  ││  ││  │ ││  ││  ││  ││  ││  │
│  │  └──┘└──┘└──┘└──┘└──┘└──┘└──┘└──┘ └──┘└──┘└──┘└──┘│  │
│  │   48  47  46  45  44  43  42  41 │ 31  32  33  34 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [Click en pieza para editar]                            │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │              GUARDAR ODONTOGRAMA                │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

**Modal Editar Pieza (al hacer click):**
```
┌────────────────────────────────────────┐
│  Editar Pieza #18                     │
│                                        │
│  Estado:                               │
│  ○ Sana                                │
│  ● Caries                              │
│  ○ Restaurado (realizado)              │
│  ○ Restaurado (de otro profesional)   │
│  ○ Extraer                             │
│  ○ Falta                               │
│                                        │
│  Cara afectada (si aplica):           │
│  ☐ Vestibular  ☐ Lingual              │
│  ☐ Oclusal     ☐ Mesial  ☐ Distal     │
│                                        │
│  [Cancelar]  [Guardar]                │
└────────────────────────────────────────┘
```

---

### 5.7 Treatments Catalog (`/treatments/catalog`)

```
┌──────────────────────────────────────────────────────────┐
│  🦷 RINADENT              Catálogo de Tratamientos      │
├────────────┬─────────────────────────────────────────────┤
│            │  [+ Nuevo Tratamiento]                    │
│  Pacientes │                                           │
│  ─────────│  ┌──────┬──────────────┬────────────────┐  │
│  Catálogo  │  │Código│ Nombre       │ Descripción    │  │
│            │  ├──────┼──────────────┼────────────────┤  │
│            │  │ 001  │ Limpieza     │ Profilaxis     │  │
│            │  │ 002  │ Obturación   │ Restauración   │  │
│            │  │ 003  │ Endodoncia   │ Canal          │  │
│            │  │ 004  │ Extracción   │ Extracción    │  │
│            │  └──────┴──────────────┴────────────────┘  │
│            │                                           │
└────────────┴─────────────────────────────────────────────┘
```

---

### 5.8 Patient Treatments (`/patients/[id]/treatments`)

```
┌──────────────────────────────────────────────────────────┐
│  ← Volver a Ficha  |  Tratamientos del Paciente         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [+ Agregar Tratamiento]                                │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ✅ 15/04/2024 - Limpieza (001)                  │   │
│  │    [Marcar pendiente] [Eliminar]                 │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ ⏳ 15/04/2024 - Obturación (002)                 │   │
│  │    [Marcar realizado] [Eliminar]                 │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ ⏳ 15/04/2024 - Radiografía (005)               │   │
│  │    [Marcar realizado] [Eliminar]                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 6. Technology Summary by Layer

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styles** | Tailwind CSS + shadcn/ui |
| **State** | Zustand + React Query (TanStack Query) |
| **DB ORM** | Supabase JS Client (direct) |
| **Database** | PostgreSQL (Supabase) |
| **Storage** | Supabase Storage |
| **Auth** | Supabase Auth |
| **Forms** | React Hook Form + Zod |
| **Deployment** | Vercel |

---

## 7. Next Steps

1. Initialize Next.js project
2. Configure Supabase SQL schema
3. Configure Supabase and connection
4. Implement authentication
5. Start PHASE 1: Patient Management

**Note**: Accounting module removed. Will be designed later with better planning.

Do you confirm this technical design to proceed with implementation?