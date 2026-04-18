# Design: Patient Detail View

## Technical Approach

Implement a patient detail page at `/patients/[id]` with 4 tabs (Medical History, Odontograma, Estudios, Tratamientos). Following existing patterns: API routes with Zod validation, TanStack Query hooks, and shadcn/ui components for dialogs and forms.

## Architecture Decisions

### Decision: Page Structure with Client-Side Tabs

**Choice**: Use shadcn/ui Tabs component with "use client" directive
**Alternatives considered**: Server components with separate routes per tab, URL-based tab state
**Rationale**: Matches existing patterns in codebase, smoother UX with no page reloads, simpler state management

### Decision: API Route Structure

**Choice**: Nested routes - `/api/patients/[id]` for patient detail, `/api/patients/[id]/medical-history` for CRUD operations
**Alternatives considered**: Query params like `/api/patients?detail=true`, combined routes with action param
**Rationale**: RESTful convention, cleaner separation of concerns, follows Next.js routing patterns

### Decision: Hook Pattern for Medical History

**Choice**: Separate hooks for fetch (useMedicalHistory), create (useCreateMedicalHistory), and individual patient fetch (usePatient)
**Alternatives considered**: Single hook with multiple methods, useMutation with dynamic mutationFn
**Rationale**: Mirrors existing pattern in `use-patients.ts` and `use-create-patient.ts`, better testability, single responsibility

### Decision: Zod Schema for Form Validation

**Choice**: Define schema in `lib/schemas/medical-history-schema.ts` separate from form component
**Alternatives considered**: Inline validation in component, use client-side only validation
**Rationale**: Reusable across API layer, testable in isolation, matches `patient-schema.ts` pattern

## Data Flow

```
Page (patients/[id]/page.tsx)
    └── PatientDetailView
          ├── usePatient(id) ──→ /api/patients/[id]
          │
          └── Tabs (MedicalHistoryTab, OdontogramaTab, etc.)
                │
                └── MedicalHistoryTab
                      ├── useMedicalHistory(id) ──→ /api/patients/[id]/medical-history
                      └── CreateMedicalHistoryDialog
                            └── useCreateMedicalHistory() ──→ POST /api/patients/[id]/medical-history
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `app/(private)/patients/[id]/page.tsx` | Create | Main patient detail page with tabs |
| `app/api/patients/[id]/route.ts` | Create | GET single patient endpoint |
| `app/api/patients/[id]/medical-history/route.ts` | Create | GET/POST medical history for patient |
| `hooks/use-patient.ts` | Create | Fetch single patient hook |
| `hooks/use-medical-history.ts` | Create | Fetch medical history list hook |
| `hooks/use-create-medical-history.ts` | Create | Create medical history entry hook |
| `lib/schemas/medical-history-schema.ts` | Create | Zod schema for medical history form |
| `components/patients/patient-detail/patient-detail-view.tsx` | Create | Main patient detail component |
| `components/patients/patient-detail/medical-history-tab.tsx` | Create | Medical history tab component |
| `components/patients/patient-detail/create-medical-history-dialog.tsx` | Create | Dialog with form for new entry |
| `app/api/patients/[id]/route.test.ts` | Create | Tests for patient detail endpoint |
| `app/api/patients/[id]/medical-history/route.test.ts` | Create | Tests for medical history API |
| `hooks/use-medical-history.test.ts` | Create | Tests for fetch hook |
| `hooks/use-create-medical-history.test.ts` | Create | Tests for create hook |

## Interfaces / Contracts

```typescript
// Patient type (extends existing Patient interface)
interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  street: string;
  street_number: string;
  locality: string;
  postal_code: string;
  gender: "male" | "female";
  condition_coverage: "health_insurance" | "private";
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Medical History entry
interface MedicalHistory {
  id: string;
  patient_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

// Zod schema for medical history form
const medicalHistorySchema = z.object({
  title: z.string().trim().min(1, "El título es requerido"),
  content: z.string().trim().min(1, "El contenido es requerido"),
});
type MedicalHistoryFormData = z.infer<typeof medicalHistorySchema>;
```

### API Endpoints

**GET /api/patients/[id]**
- Response: `{ data: Patient }`
- Error: 404 if not found, 500 on DB error

**GET /api/patients/[id]/medical-history**
- Response: `{ data: MedicalHistory[] }`
- Error: 500 on DB error

**POST /api/patients/[id]/medical-history**
- Body: `{ title: string, content: string }`
- Response: `{ data: MedicalHistory }`
- Error: 400 validation, 500 on DB error

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit - API | Request validation, pagination, error handling | Vitest with mocked Supabase |
| Unit - Hooks | Query key generation, mutation behavior, error handling | Vitest with mocked fetch |
| Unit - Schema | Validation rules, error messages | Vitest with zod |
| Integration | Full form flow, dialog interactions | Playwright (future) |

## Migration / Rollout

No migration required. New feature with new tables already populated.

## Open Questions

- [ ] Should Medical History support editing (PUT) and deletion (DELETE)?
- [ ] What fields are needed for "Odontograma" tab? Schema not defined in specs.
- [ ] Should "Estudios" and "Tratamientos" tabs have CRUD or read-only for MVP?