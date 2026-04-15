# Architecture Plan - Dental Practice Management System

## Executive Summary

| Aspect | Decision |
|--------|----------|
| **Stack** | Next.js 14 + Supabase + shadcn/ui + Zustand |
| **Cost** | $0 / month (Vercel + Supabase free tier) |
| **Frontend** | Next.js App Router, TypeScript, Tailwind |
| **Backend** | Next.js API Routes (serverless) |
| **DB** | PostgreSQL (Supabase) |
| **Storage** | Supabase Storage for images |
| **Phases** | 6 phases, ~7-8 weeks |
| **Auth** | Supabase Auth (single user) |

---

## 1. Technology Stack Recommendation

### Main Option: **Next.js + Supabase** (100% free)

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | Next.js 14 (App Router) | SSR/SSG included, automatic deploy to Vercel (free tier), automatic routing |
| **Backend** | Next.js API Routes (Route Handlers) | Serverless functions in the same deployment, no separate server needed |
| **Database** | Supabase (PostgreSQL) | **500MB storage**, **10k rows/month** (enough for a dental practice), **Auth** included, **Row Level Security** |
| **Storage (images)** | Supabase Storage | Store X-rays, tomographies, patient photos |
| **DB ORM** | Supabase JS Client (direct) |
| **UI** | shadcn/ui + Tailwind CSS | Accessible components, fast professional design |
| **State** | Zustand | Simple, less boilerplate than Redux, perfect for this type of app |

### Free Tier Limits (enough for a dental practice)

| Resource | Free Limit | Enough? |
|---------|-------------|-----------|
| Supabase DB | 500MB / 10k rows/month | ✅ A dental practice won't reach 10k patients |
| Supabase Storage | 1GB | ✅ Enough for years of images |
| Vercel | 100GB bandwidth/month | ✅ Only the dentist uses the app |
| Vercel Build | 100h/month | ✅ No daily automatic builds |

---

## 2. Project Folder Structure

```
rinadent-app/
├── prisma/
│   └── schema.prisma              # DB models and relationships
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (dashboard)/            # Route group (shared layout)
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx        # Patients list
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx    # Patient detail
│   │   │   │   │   ├── edit/
│   │   │   │   │   ├── medical-history/
│   │   │   │   │   ├── studies/
│   │   │   │   │   ├── odontogram/
│   │   │   │   │   └── treatments/
│   │   │   │   └── new/page.tsx    # Create patient
│   │   │   ├── treatments/
│   │   │   │   └── catalog/page.tsx
│   │   │   └── layout.tsx          # Sidebar + nav
│   │   ├── api/                    # API Routes (if needed)
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Login / Landing
│   ├── components/
│   │   ├── ui/                     # shadcn base components
│   │   ├── patients/              # Patient module specific components
│   │   ├── medical-history/       # Medical history components
│   │   ├── studies/               # Studies components
│   │   ├── odontogram/            # Odontogram components
│   │   └── treatments/            # Treatments components
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client singleton
│   │   ├── auth.ts                 # Supabase auth helpers
│   │   └── utils.ts                # Utils (formats, calculations)
│   ├── types/                      # Global TypeScript types
│   └── hooks/                      # Custom hooks (usePatient, etc.)
├── public/                         # Static assets
├── supabase/
│   └── migrations/                 # SQL migrations if needed
├── .env.example                    # Environment variables template
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Database Structure (SQL Schema preview)

```
Patient
├── id (UUID)
├── firstName, lastName
├── dateOfBirth → calculates age
├── address (street, streetNumber, locality, postalCode)
├── gender
├── conditionCoverage (enum: obra_social | particular)
├── isActive (boolean) → soft delete
├── createdAt, updatedAt
│
├── MedicalHistory (1:1)
│   ├── all yes/no fields
│   ├── covidObservation (nullable)
│   ├── medications
│   ├── oncologicalTreatment (enum)
│   ├── previousLabResults (enum)
│   ├── currentLabResults (enum)
│
├── Studies (1:N) → ordered by date
│   ├── type (radiography | tomography | photography)
│   ├── fileUrl (storage url)
│   ├── studyDate
│
├── Odontogram (1:1)
│   ├── lastUpdatedAt
│   └── teeth (JSON with state of each piece)
│
└── Treatments (N:N via pivot table)
    ├── treatmentId (FK)
    └── registeredAt
```

---

## 3. Development Roadmap - Phases

### **PHASE 1: Fundamentals and Patient Management** (Week 1-2)

**Goal**: Complete CRUD for patients with list and search

- [ ] Setup Next.js + Supabase project
- [ ] Configure complete database schema
- [ ] Authentication (simple login, single user)
- [ ] CRUD Patients: create, list (only active), edit, delete (soft delete)
- [ ] Automatic age calculation from date of birth
- [ ] Required field validations
- [ ] Patient detail page (basic record)

**Deliverable**: Patients registered, listed, edited, soft deleted

---

### **PHASE 2: Medical History** (Week 2-3)

**Goal**: Complete clinical history recording

- [ ] Medical history form with all boolean fields
- [ ] Conditional COVID field (only if "Yes")
- [ ] Free text fields (medications)
- [ ] Selects for enumerated fields (oncology, lab)
- [ ] Integration in patient record
- [ ] Auto or manual save

**Deliverable**: Basic clinical history per patient

---

### **PHASE 3: Studies and Images** (Week 3-4)

**Goal**: Upload and view clinical studies

- [ ] File upload to Supabase Storage
- [ ] Types: radiography, tomography, photography
- [ ] Study date registration
- [ ] Chronological list per patient
- [ ] Basic image viewer
- [ ] Study deletion

**Deliverable**: Clinical file management with storage

---

### **PHASE 4: Odontogram** (Week 4-5)

**Goal**: Visual representation of dental condition

- [ ] 32-tooth graphical representation
- [ ] Colors: red (completed), blue (pending)
- [ ] Marks: blue cross (extract), red cross (missing), affected face
- [ ] Last update date (auto)
- [ ] Visual editing (click on tooth to change state)
- [ ] Complete state persistence

**Deliverable**: Editable and historical odontogram

---

### **PHASE 5: Treatments** (Week 5-6)

**Goal**: Treatment catalog and patient assignment

- [ ] CRUD Treatment catalog
- [ ] Official code from dental college
- [ ] Register treatments to perform for patient
- [ ] Auto registration date (today)
- [ ] Catalog linking
- [ ] Patient treatments list

**Deliverable**: Treatment plan management

---

### **PHASE 6: Polish and Deployment** (Week 6-7)

**Goal**: QA, UX improvements, production deployment

- [ ] UX/UI improvements (complete shadcn/ui)
- [ ] Responsive design (mobile-friendly)
- [ ] Manual testing of all flows
- [ ] Deploy to Vercel + Supabase
- [ ] Backup and recovery (document)
- [ ] Usage documentation

**Deliverable**: Production-ready app

---

## 4. Important Architectural Decisions

### 🔹 Decision 1: Frontend-only with API Routes

**Chosen**: No separate backend server

**Justification**:
- Single repo, single deployment
- Next.js API Routes enough for this volume
- No need for a dedicated server for a single practice

**Trade-off**: If volume grows a lot, migrate to Express/Go later

---

### 🔹 Decision 2: Supabase (not Firebase)

**Chosen**: PostgreSQL over NoSQL

**Justification**:
- PostgreSQL has **real relationships** (patient → studies → treatments)
- Supabase JS Client + PostgreSQL = direct queries
- Supabase = PostgreSQL + Auth + Storage
- Firebase has better offline-first but this app is online-only

**Trade-off**: If offline sync needed later, evaluate Firebase

---

### 🔹 Decision 3: Odontogram as JSON

**Chosen**: Store odontogram state as JSON in a single field

**Justification**:
- 32 teeth + states don't need their own table
- JSON allows adding fields without migration
- Supabase JS Client supports JSONB type in PostgreSQL

**Alternative considered**: `Tooth` table with FK to patient

```prisma
// Alternative (NOT chosen to simplify)
model OdontogramPiece {
  id        String  @id @default(uuid())
  tooth     Int     // 1-32
  status    String  // "healthy" | "caries" | "restored" | "extract" | "missing"
  face      String? // "vestibular" | "occlusal" | etc.
  patient   Patient @relation(...)
}
```

**Trade-off**: Less queryable, but simple enough for this case

---

### 🔹 Decision 4: Images in Supabase Storage (not S3/Cloudinary)

**Chosen**: Native Supabase Storage

**Justification**:
- Same provider = less cost/complexity
- 1GB free is enough
- Direct backend integration

**Trade-off**: If image transformation needed later, evaluate Cloudinary

---

### 🔹 Decision 5: shadcn/ui over custom components

**Chosen**: shadcn/ui components as base

**Justification**:
- Professional design out-of-the-box
- Tailwind = easy to customize
- Included accessibility
- 100% yours (not a blocking dependency)

---

### 🔹 Decision 6: Single user (no complex RBAC)

**Chosen**: Simple authentication (Single Superuser)

**Justification**:
- Requirement says "single actor: dentist"
- No need for multiple roles
- Supabase Auth + email/password is enough
- If staff needed later, add it

---

### 🔹 Decision 7: isActive instead of deleted

**Chosen**: `isActive` boolean for soft delete

**Justification**:
- More intuitive naming (isActive = true means patient is active)
- Consistent with Treatment model which also uses isActive
- Easy to query: `where: { isActive: true }`

---

### 🔹 Decision 8: Accounting module removed

**Chosen**: No accounting in this version

**Justification**:
- User preference to design it better later
- Focus on core clinical features first
- Accounting can be added as a separate module when needed

---

## Notes

- **Database schema and folder structure**: All in **English**
- **UI of the application**: In **Spanish**
- **Code** (models, components, functions): In **English**
- **Accounting module**: Removed, will be designed later
- **Soft delete**: Using `isActive` boolean instead of `deleted`