# Tasks: Patient Detail View

## Phase 1: Infrastructure & Schema

- [x] 1.1 Create `lib/schemas/medical-history-schema.ts` with Zod schema based on actual table fields (allergies, heart_condition, diabetes, hypertension, anticoagulation, bisphosphonates, osteoporosis, hemophilia, covid, covid_observation, bone_density_studies, medications, oncological_treatment, previous_lab_results, current_lab_results)
- [x] 1.2 Create `app/api/patients/[id]/route.ts` (GET single patient by id)
- [x] 1.3 Create `app/api/patients/[id]/medical-history/route.ts` (GET fetch medical_history for patient, POST create medical_history entry)

## Phase 2: Backend Tests (TDD - RED first)

- [x] 2.1 Write `app/api/patients/[id]/route.test.ts` - test GET returns patient data, returns 404 for non-existent (RED)
- [x] 2.2 Write `app/api/patients/[id]/medical-history/route.test.ts` - test GET returns medical_history, POST creates entry (RED)
- [x] 2.3 Run tests to verify they fail (expected failure)

## Phase 3: Backend Implementation (Make tests GREEN)

- [x] 3.1 Implement GET in `app/api/patients/[id]/route.ts` - fetch patient by UUID, return 404 if not found
- [x] 3.2 Implement GET in `app/api/patients/[id]/medical-history/route.ts` - fetch medical_history by patient_id
- [x] 3.3 Implement POST in `app/api/patients/[id]/medical-history/route.ts` - insert new medical_history record
- [x] 3.4 Run tests to verify they pass

## Phase 4: Hooks

- [x] 4.1 Create `hooks/use-patient.ts` - fetch single patient by id using TanStack Query
- [x] 4.2 Create `hooks/use-medical-history.ts` - fetch medical history for patient using TanStack Query
- [x] 4.3 Create `hooks/use-create-medical-history.ts` - create medical history entry with form validation

## Phase 5: Hook Tests (TDD - RED first)

- [x] 5.1 Write `hooks/use-patient.test.ts` - test query key, fetcher call (RED)
- [x] 5.2 Write `hooks/use-medical-history.test.ts` - test query keys, data transformation (RED)
- [x] 5.3 Write `hooks/use-create-medical-history.test.ts` - test mutation, invalidation (RED)

## Phase 6: Hook Implementation (Make tests GREEN)

- [x] 6.1 Implement `hooks/use-patient.ts` - useQuery with patient query key
- [x] 6.2 Implement `hooks/use-medical-history.ts` - useQuery with medical-history query key
- [x] 6.3 Implement `hooks/use-create-medical-history.ts` - useMutation with schema validation
- [x] 6.4 Run tests to verify they pass

## Phase 7: UI Components

- [x] 7.1 Create `components/patients/patient-detail/create-medical-history-dialog.tsx` - Dialog with checkboxes for all boolean fields, select for enums
- [x] 7.2 Create `components/patients/patient-detail/medical-history-tab.tsx` - Display medical history data with Create button
- [x] 7.3 Create `components/patients/patient-detail/odontograma-tab.tsx` - Placeholder: just title "Odontograma"
- [x] 7.4 Create `components/patients/patient-detail/estudios-tab.tsx` - Placeholder: just title "Estudios"
- [x] 7.5 Create `components/patients/patient-detail/tratamientos-tab.tsx` - Placeholder: just title "Tratamientos"
- [x] 7.6 Create `components/patients/patient-detail/patient-detail-view.tsx` - Main component with Tabs (shadcn/ui)

## Phase 8: Page Integration

- [x] 8.1 Create `app/(private)/patients/[id]/page.tsx` - Page with PatientDetailView, usePatient to fetch data
- [x] 8.2 Modify `components/patients/patients-table.tsx` - Change pencil icon Link to `/patients/${patient.id}` instead of modal

## Phase 9: Schema Tests

- [x] 9.1 Write `lib/schemas/medical-history-schema.test.ts` - test validation rules for all fields (RED then GREEN)

## Phase 10: Integration & Polish

- [x] 10.1 Test full flow: navigate to patient detail, view medical history tab, create new entry
- [x] 10.2 Verify placeholder tabs show correct titles
- [x] 10.3 Run all tests to ensure nothing broke
