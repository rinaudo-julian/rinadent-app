# Spec: Patient Detail View

## Requirement 1 — Patient Detail Route
The system MUST provide `/patients/[id]` and render the patient full name as title.

### Scenario: Existing patient
- **GIVEN** a valid patient ID
- **WHEN** user navigates to `/patients/[id]`
- **THEN** page renders title with `first_name + last_name`

### Scenario: Missing patient
- **GIVEN** an unknown patient ID
- **WHEN** user navigates to `/patients/[id]`
- **THEN** page renders not-found style error state

## Requirement 2 — Functional Tabs
The detail page MUST show four functional tabs:
- Historial Médico
- Odontograma
- Estudios
- Tratamientos

### Scenario: Tab switch
- **GIVEN** tabs are visible
- **WHEN** user clicks any tab trigger
- **THEN** corresponding tab content is rendered

## Requirement 3 — Placeholder Tabs in this iteration
For Odontograma, Estudios and Tratamientos, content MUST be title-only.

### Scenario: Odontograma placeholder
- **THEN** content renders only title `Odontograma`

### Scenario: Estudios placeholder
- **THEN** content renders only title `Estudios`

### Scenario: Tratamientos placeholder
- **THEN** content renders only title `Tratamientos`

## Requirement 4 — Medical History Empty State and Create Flow
When patient has no medical history, UI MUST show:
- `No hay historial médico para este paciente`
- button `Crear historial médico`

### Scenario: Open create dialog
- **WHEN** user clicks create button
- **THEN** dialog opens with medical history form

## Requirement 5 — Medical History Form Fields
Medical history form MUST include all table-aligned fields:
- allergies
- heart_condition
- diabetes
- hypertension
- anticoagulation
- bisphosphonates
- osteoporosis
- hemophilia
- covid
- covid_observation (conditional)
- bone_density_studies
- medications
- oncological_treatment
- previous_lab_results
- current_lab_results

### Scenario: Conditional COVID observation
- **GIVEN** `covid = 1`
- **THEN** `covid_observation` is required

## Requirement 6 — APIs
The system MUST provide:
- `GET /api/patients/[id]`
- `GET /api/patients/[id]/medical-history`
- `POST /api/patients/[id]/medical-history`

## Requirement 7 — Data Hooks
The system MUST provide:
- `usePatient`
- `useMedicalHistory`
- `useCreateMedicalHistory`
