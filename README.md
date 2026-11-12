# 🎓 CAMPUS-NEXUS v2 — Cognitive Campus Operating System

> **From a mark to a decision.**  
> *The AI layer that turns every mark, ticket and schedule on campus into a decision.*  
> **Prasunex Innovathon 2026 Competition Entry**  
> **Team:** Vanshika Yadav | Himadri Mondal

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![ONNX Runtime](https://img.shields.io/badge/ONNX_Runtime-INT8_CPU--Only-005CED?style=for-the-badge&logo=onnx&logoColor=white)](https://onnxruntime.ai/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector_16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.16-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Tests Passing](https://img.shields.io/badge/Tests-9%2F9%20Passing-success?style=for-the-badge&logo=pytest&logoColor=white)](#23-testing--quality-assurance)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 🌐 Live Deployments & Repository Links

- **🌍 Live Deployed Showcase:** [https://campus-nexus0.netlify.app/](https://campus-nexus0.netlify.app/)
- **💻 GitHub Official Repository:** [https://github.com/vanshikayadav6153-ai/prasunex-innovathon-2026](https://github.com/vanshikayadav6153-ai/prasunex-innovathon-2026)
- **🖥️ Local Web Application:** [http://localhost:3000](http://localhost:3000)
- **📑 Interactive OpenAPI / Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **🩺 API Health Endpoint:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 📑 Table of Contents

- [1. Project Title \& Introduction](#1-project-title--introduction)
- [2. Project Overview \& Core Positioning](#2-project-overview--core-positioning)
- [3. Executive Summary](#3-executive-summary)
- [4. Problem Statement](#4-problem-statement)
- [5. Proposed Solution: The Campus-Nexus Loop](#5-proposed-solution-the-campus-nexus-loop)
- [6. Project Objectives \& Value Proposition](#6-project-objectives--value-proposition)
- [7. Target Users \& User Personas](#7-target-users--user-personas)
- [8. Feature-by-Feature Documentation](#8-feature-by-feature-documentation)
- [9. Complete User Workflow (2-Minute Judge Guide)](#9-complete-user-workflow-2-minute-judge-guide)
- [10. Visual Showcase \& Portal Walkthrough](#10-visual-showcase--portal-walkthrough)
- [11. System Architecture](#11-system-architecture)
- [12. Architecture Explanation](#12-architecture-explanation)
- [13. Technology Stack (Exact Versions)](#13-technology-stack-exact-versions)
- [14. Project Directory Structure](#14-project-directory-structure)
- [15. Installation \& Quick Start](#15-installation--quick-start)
- [16. Prerequisites](#16-prerequisites)
- [17. Environment Variables](#17-environment-variables)
- [18. API Documentation \& Data Contracts](#18-api-documentation--data-contracts)
- [19. Database Schema \& State Management](#19-database-schema--state-management)
- [20. Authentication \& Authorization](#20-authentication--authorization)
- [21. Security \& Privacy Architecture](#21-security--privacy-architecture)
- [22. Error Handling \& Resilience](#22-error-handling--resilience)
- [23. Testing \& Quality Assurance](#23-testing--quality-assurance)
- [24. Performance Optimization \& Edge Efficiency](#24-performance-optimization--edge-efficiency)
- [25. Deployment Guide](#25-deployment-guide)
- [26. Future Roadmap](#26-future-roadmap)
- [27. Known Limitations \& Honest Disclosures](#27-known-limitations--honest-disclosures)
- [28. Contribution Guidelines](#28-contribution-guidelines)
- [29. Development Workflow](#29-development-workflow)
- [30. License \& Ownership](#30-license--ownership)
- [31. Author \& Project Links](#31-author--project-links)
- [32. Acknowledgments \& References](#32-acknowledgments--references)

---

## 1. Project Title & Introduction

**CAMPUS-NEXUS v2** is an enterprise-grade, multi-tenant Cognitive Campus Operating System engineered specifically for Indian engineering colleges and universities. 

Built to modernize and replace legacy academic ERPs (such as SAP Higher Education, Ellucian Banner, or disparate paper/Excel systems), CAMPUS-NEXUS unifies academic diagnostics, grading fairness, facility operations, accreditation reporting, and student trust into one cohesive, real-time intelligence loop.

Targeted at an ultra-scalable institutional pricing model of **$2.50 to $4.00 / student / year**, CAMPUS-NEXUS operates **100% on CPU-only local quantized ONNX machine learning models**, eliminating expensive recurring cloud LLM API costs while preserving strict data residency and institutional sovereignty.

---

## 2. Project Overview & Core Positioning

### Tagline
> **“From a mark to a decision.”**

### Core Positioning
> *“The AI layer that turns every mark, ticket and schedule on campus into a decision.”*

CAMPUS-NEXUS bridges the historic gap between academic performance data, campus infrastructure maintenance, accreditation reporting, and student wellbeing. Rather than recording historic marks in dead spreadsheets, the platform actively interprets academic signals to trigger preventive actions before midterms or final exams.

---

## 3. Executive Summary

| Metric / Dimension | Specification |
|---|---|
| **Platform Target** | Indian Engineering Universities & Autonomous Technical Colleges |
| **Institutional Model** | Multi-tenant SaaS with row-level data isolation by `tenant_id` |
| **Pricing Tiers** | **Core** (Free, up to 500 students), **Cognitive** ($2.50/student/yr), **Autonomous Enterprise** ($4.00/student/yr) |
| **User Personas** | 5 Distinct Roles: Administrator, Professor/HOD, Student, Lab Technician, Recruiter |
| **AI/ML Footprint** | CPU-only INT8 ONNX models (GRU-DKT, MobileNet defect vision, Blake2b SBERT-style embeddings) |
| **Accreditation Support** | 1-Click SAR generation for **NBA** (Criteria 2, 3, 6) and **NAAC** (Criteria 2, 7) |
| **Zero-Knowledge Privacy**| RSA blind-signature enrollment tokens for untraceable student whistleblowing |
| **Test Coverage** | 9 end-to-end pytest API test suites covering all authenticated roles and services |

---

## 4. Problem Statement

Modern Indian engineering campuses suffer from three deep structural disconnects:

1. **Academic Signals Arrive Too Late (Siloed Performance):**  
   Semester marks and midterms simply state that a student failed a test; they fail to diagnose *why*. Prerequisite gaps (e.g., struggling with Graph Traversal because Recursion was never mastered) go undetected until the student is at risk of academic debarment or dropout.
2. **Operations & Maintenance Disconnect (Siloed Facilities):**  
   Broken laboratory oscilloscopes, faulty air conditioning, or plumbing leaks in hostels are reported haphazardly across WhatsApp groups, paper registers, or email chains. Duplicate tickets flood technicians, SLA deadlines are breached without escalation, and audit trails are nonexistent.
3. **The Student Trust Deficit (Fear of Retaliation):**  
   Sensitive grievances (anti-ragging, POSH, harassment, mental health crises) frequently go unreported because students fear academic or disciplinary retaliation from college administration when submitting identified reports.

---

## 5. Proposed Solution: The Campus-Nexus Loop

CAMPUS-NEXUS binds every campus entity into a continuous 4-stage intelligence loop:

```mermaid
flowchart LR
    A["01. EXPLAIN\nTrace raw mark to prerequisite concept gap"] --> B["02. DECIDE\nSimulate fair relative grading & intervention plan"]
    B --> C["03. ACT\nDispatch SLA tickets & target 3-question micro-drills"]
    C --> D["04. LEARN\nFeed outcome back into cohort & accreditation matrices"]
    D --> A
```

- **EXPLAIN:** Deep Knowledge Tracing (DKT-Graph) analyzes response sequences to pinpoint the root unmastered prerequisite.
- **DECIDE:** Professors test relative grading curves (Gaussian + KDE) with live mean/std sliders and IRT question quality audits.
- **ACT:** Technicians receive MobileNet-classified, deduplicated maintenance tickets with 48-hour SLA countdown timers.
- **LEARN:** Accreditation attainment matrices (CO-PO) update continuously without end-of-semester manual panic.

---

## 6. Project Objectives & Value Proposition

- **Prevent Academic Debarment:** Forecast attendance drop-out risk early and show students exactly how many classes they can safely skip or must attend to clear the 75% threshold.
- **Fair, Transparent Grading:** Eliminate arbitrary mark curving by providing professors with an interactive statistical sandbox featuring z-scores and Item Response Theory (IRT) difficulty and discrimination metrics.
- **Streamline Campus Operations:** Triage lab maintenance requests using MobileNet defect classification and merge duplicate tickets using 384-dimensional semantic cosine similarity ($\ge 0.82$).
- **Protect Student Whistleblowers:** Provide true mathematical anonymity for ragging/POSH reports using cryptographic RSA blind signatures and dual-custody encryption keys.
- **Eliminate Accreditation Overhead:** Auto-generate CO-PO attainment matrices and produce 1-click NBA Criteria 2, 3, 6 and NAAC Criteria 2, 7 SAR packages in PDF, DOCX, and CSV formats.

---

## 7. Target Users & User Personas

```mermaid
graph TD
    User["CAMPUS-NEXUS Portal Access"]
    User --> Admin["🏛️ Campus Administrator (Dean / Chancellor)"]
    User --> Prof["👩‍🏫 Professor / HOD"]
    User --> Stu["🎒 Student"]
    User --> Tech["🔧 Lab Technician / Warden"]
    User --> Rec["💼 Recruiter"]

    Admin --- AdminF["Tenant ARR Billing · Accreditation Packages · System Analytics"]
    Prof --- ProfF["Relative Grading Sandbox · IRT Question Audit · At-Risk Cohort Radar"]
    Stu --- StuF["DKT Knowledge Radar · Attendance Forecaster · Micro-Drills · ZK Grievance"]
    Tech --- TechF["Vision Defect Triage · Duplicate Ticket Merging · 48h SLA Countdown"]
    Rec --- RecF["Talent Search · Concept-based Mastery Filters · 1-Click Invites"]
```

### 1-Click Demo Accounts (Pre-configured for Evaluators)

| Role | Demo Email | Password | Tenant Code | Target Responsibilities |
|---|---|---|---|---|
| **Campus Administrator** | `admin@nitx.demo` | `admin` | `NITX` | Institutional overview, multi-tier billing ($2.50 vs $4.00 ARR), NBA/NAAC attainment exports |
| **Professor / HOD** | `professor@nitx.demo` | `professor` | `NITX` | Course marks upload, Gaussian + KDE relative grading simulation, IRT question audit |
| **Student** | `student001@nitx.demo` | `student123` | `NITX` | BKT Knowledge Radar, 75% attendance threshold predictor, 7-day study planner, micro-drills |
| **Lab Technician** | `technician@nitx.demo` | `technician` | `NITX` | Facilities ticket queue, defect triage, SLA escalation monitoring, ticket resolution |
| **Recruiter** | `recruiter@nitx.demo` | `recruiter` | `NITX` | Opted-in talent search by concept mastery & CGPA, interview invitation dispatches |

*(Alternative tenant **`RBCE`** (Riverbend College of Engineering) is available by replacing `nitx` with `rbce` in demo emails).*

---

## 8. Feature-by-Feature Documentation

### Core Features

#### 1. Multi-Tenant Tenancy & Subscription Engine (`auth_tenancy.py`)
- Complete data isolation: every database row is strictly scoped to `tenant_id` (`college_id`).
- Real-time billing estimation: Admin console computes institutional ARR based on enrolled students $\times$ tier rate.
- Feature gating dependency (`require_feature`): Enforces tier access rules at the FastAPI route level.

#### 2. Relative Grading Sandbox (`grading.py`)
- **CSV Marks Import:** Drag-and-drop ingestion of question-level marks (`student_id`, question scores).
- **Interactive Curve Fitting:** Real-time computation of Gaussian PDF and Kernel Density Estimation (KDE) curves.
- **Live Statistical Sliders:** Interactive Mean Shift ($-10.0$ to $+10.0$) and Standard Deviation Scale ($0.5\times$ to $2.0\times$) recalculating grade boundaries (S, A, B, C, D, F) in real time.
- **Z-Score Normalization:** Automatic conversion of raw marks to normalized z-scores.
- **CSV Grade Export:** One-click download of curved grade sheets.

#### 3. Item Response Theory (IRT) Question Quality Audit (`grading.py`)
- Computes **Item Difficulty ($b$)** via logit-transformed pass rates.
- Computes **Item Discrimination ($a$)** using corrected item-total point-biserial correlation ($r_{it}$).
- Automatic Warning Flags:
  - `TRICKY / LOW DISCRIMINATION`: Questions where high-performing students scored worse than low-performing students ($r_{it} < 0.20$).
  - `EXTREME DIFFICULTY`: Questions with pass rates $< 15\%$ or $> 95\%$.

#### 4. Bayesian & Deep Knowledge Tracing (DKT) Diagnostics (`study.py`, `inference.py`)
- **Prerequisite Concept DAG:** Multi-level directed acyclic graph mapping courses to prerequisite concepts.
- **Dual-Model Inference:**
  - *Bayesian Knowledge Tracing (BKT):* Dynamic posterior update with parameter slip ($P_S=0.10$), guess ($P_G=0.20$), and transit ($P_T=0.18$).
  - *Deep Knowledge Tracing (GRU-DKT):* Quantized INT8 ONNX recurrent network mapping sequential interactions to concept mastery states.
- **Knowledge Radar:** Spider/Radar visualization of student competencies.
- **Prerequisite Path Diagnostic:** Traces a weak concept (e.g. Graph Traversal, 42%) back to its unmastered prerequisite (e.g. Recursion, 51%).

#### 5. Adaptive Micro-Drills & 7-Day AI Study Planner (`study.py`)
- Generates personalized 25-minute study sessions budgeted against student daily availability.
- Generates 3-question targeted micro-drills focused strictly on weakest prerequisite concepts.
- Interactive mark-as-complete updates knowledge state immediately.

#### 6. Predictive Attendance Forecaster (`attendance.py`)
- Course-level attendance tracking evaluating against the statutory **75% minimum debarment threshold**.
- Real-time predictive calculations:
  - `classes_can_skip`: Number of future sessions a student can miss while remaining $\ge 75\%$.
  - `classes_to_attend`: Exact number of consecutive classes a student must attend to recover from attendance shortage.
  - Early-warning flags for HODs identifying at-risk students weeks before semester exams.

#### 7. Multimodal Facilities Grievance Desk (`facilities.py`, `inference.py`)
- **Vision Defect Triage:** MobileNet-style INT8 ONNX classifier categorizing issues into 6 classes: `electrical`, `plumbing`, `it_hardware`, `furniture`, `civil`, `safety`.
- **Semantic Ticket Deduplication:** Blake2b 384-dimensional hashed token embeddings computed in CPU memory. Duplicate tickets with cosine similarity $\ge 0.82$ are automatically flagged for merging.
- **48-Hour SLA Timer:** Visual countdown timer tracking resolution deadlines with audit history logging.

#### 8. Zero-Knowledge Anonymous Reporting (`privacy.py`)
- Cryptographic RSA Blind Signature protocol:
  1. Student blinds a randomized token with the college's public key.
  2. College server signs the blinded token (proving the submitter is an enrolled student) without learning the token content.
  3. Student unblinds the signature and submits the report with dual-custody encryption (Dean key share + ICC key share).
- Admins cannot link the report to the student's identity.
- Anonymous two-way chat channel via a secure 64-character tracking code.

#### 9. NBA / NAAC Accreditation Automation (`accreditation.py`)
- Maps assessment questions to Course Outcomes (CO1–CO5), Bloom's Taxonomy ($L_1$–$L_6$), and Program Outcomes (PO1–PO12).
- Automatic generation of CO-PO Attainment Matrices.
- **1-Click Accreditation Package:** Downloadable SAR report in PDF, DOCX, and CSV formats fulfilling NBA Criteria 2, 3, 6 and NAAC Criteria 2, 7.

#### 10. Peer Study Matcher & Recruiter Talent Marketplace (`network.py`)
- **Peer Matcher:** Bipartite matching pairing students with low concept mastery with peer tutors possessing high mastery in that specific concept.
- **Karma Score:** Reward tracking for student mentors.
- **Recruiter Marketplace:** Filterable search (CGPA, department, concept mastery) showing only opted-in students without revealing private contact details until official interview invitations are extended.

---

## 9. Complete User Workflow (2-Minute Judge Guide)

Experience the entire platform workflow end-to-end in 5 simple steps at [http://localhost:3000](http://localhost:3000):

```mermaid
sequenceDiagram
    autonumber
    actor Judge as Evaluator / Judge
    participant UI as Next.js Web App
    participant API as FastAPI Backend
    participant ML as ONNX INT8 Engine

    Judge->>UI: 1. Click "Sign in" -> Select Student pill (student001@nitx.demo)
    UI->>API: POST /api/auth/login
    API-->>UI: JWT Bearer Token + Student Profile
    UI->>Judge: Display Academic Mastery (68%) & Attendance (76.8%)
    
    Judge->>UI: 2. Navigate to "My Learning" -> Select CS301
    UI->>API: GET /api/knowledge/me
    API-->>UI: Concept DAG (Recursion -> Graph Traversal)
    UI->>Judge: Highlight Prerequisite Gap (Graph Traversal hindered by Recursion)

    Judge->>UI: 3. Navigate to "Study Planner" -> Click "Regenerate"
    UI->>API: POST /api/study-plan/generate
    API-->>UI: 7-Day Targeted Plan (prioritizing low mastery)
    Judge->>UI: Mark session 1 complete -> Instant mastery update

    Judge->>UI: 4. Switch User -> Select Professor (professor@nitx.demo)
    Judge->>UI: Navigate to "Grading Sandbox" -> Slide Mean (+2.5) & Std (1.1x)
    UI->>API: POST /api/grading/sandbox
    API->>ML: Compute Gaussian + KDE & IRT Item Discrimination
    API-->>UI: Updated S/A/B/C/D/F Distribution + Flawed Question Flags

    Judge->>UI: 5. Switch to Technician -> View "Facilities Desk"
    UI->>API: GET /api/facilities/tickets
    API-->>UI: Ticket list with MobileNet classification, cosine dedup & 48h SLA timer
```

---

## 10. Visual Showcase & Portal Walkthrough

The CAMPUS-NEXUS v2 user experience is structured into three unified portals:

### 1. Student Portal (`student001@nitx.demo`)
- **Dashboard Overview:** Displays term GPA, overall BKT mastery estimate, safe skip attendance counter, and recent campus notices.
- **Knowledge Radar:** Recharts Spider visualization mapping competency across course prerequisites.
- **Attendance Forecaster:** Color-coded 75% threshold guide indicating remaining safe skips or mandatory classes to attend.
- **Micro-Drills:** 3-question rapid assessments that feed posterior probability updates directly into the knowledge engine.
- **Anonymous Whistleblowing:** Secure form generating RSA blind-signature enrollment tokens and a private tracking code.

### 2. Professor Portal (`professor@nitx.demo`)
- **Cohort Performance:** Real-time visibility into students at risk of midterm failure or attendance debarment.
- **Grading Sandbox:** Interactive Gaussian and Kernel Density Estimation distribution curves updating dynamically as sliders are manipulated.
- **IRT Assessment Audit:** Item difficulty and discrimination tables flagging statistically flawed questions.
- **NBA Attainment Matrix:** Automated CO-PO calculation based on question-level rubric mappings.

### 3. Administrator Console (`admin@nitx.demo` / `technician@nitx.demo`)
- **Institutional ARR Calculator:** Real-time billing overview based on enrolled students ($2.50 vs $4.00 per student per year).
- **Facilities & Maintenance Desk:** Ticket management with MobileNet vision triage, deduplication groupings, and active 48-hour SLA countdowns.
- **Accreditation Download Center:** One-click generation of SAR packages (PDF, DOCX, CSV).

> *Visual artifacts can be captured directly from the running frontend instance at `http://localhost:3000`.*

---

## 11. System Architecture

```mermaid
graph TB
    subgraph ClientLayer ["Client Layer (Next.js 14 App Router)"]
        UI["Tailwind CSS + Lucide Icons + Recharts UI"]
        State["Client State & JWT Local Storage"]
        PWA["Responsive Desktop & Mobile Viewports"]
    end

    subgraph GatewayLayer ["API & Security Gateway (FastAPI)"]
        Router["FastAPI Application Router (/api)"]
        CORS["CORS Middleware"]
        AuthMid["JWT RBAC & Tenant Scoping"]
        TierGate["Feature Gating Middleware (require_feature)"]
    end

    subgraph ServiceModules ["Backend Domain Services"]
        M1["Auth & Tenancy Service"]
        M2["Grading & IRT Sandbox"]
        M3["DKT & BKT Knowledge Tracing"]
        M4["Accreditation SAR Generator"]
        M5["Attendance Forecaster"]
        M6["Facilities & Vision Triage"]
        M7["ZK Anonymous Reporting"]
        M8["Peer & Talent Marketplace"]
    end

    subgraph MLLayer ["Local Edge ML Engine (CPU-Only)"]
        ONNX1["dkt_gru_int8.onnx (Interactions -> Mastery)"]
        ONNX2["vision_triage_int8.onnx (MobileNet Defect Classifier)"]
        SBERT["Blake2b 384-d Hashed Dense Embeddings"]
        BKT["BKT Closed-Form Posterior Updater"]
    end

    subgraph PersistenceLayer ["Data Persistence"]
        DB[("PostgreSQL 16 (pgvector) / SQLite Fallback")]
        Redis[("Redis 7 Cache (Optional)")]
        Storage["Local Secure File Storage (/uploads)"]
    end

    ClientLayer -->|HTTPS / JSON REST| GatewayLayer
    GatewayLayer --> ServiceModules
    ServiceModules --> MLLayer
    ServiceModules --> PersistenceLayer
```

---

## 12. Architecture Explanation

1. **Strict Multi-Tenancy:**  
   Every database query filters strictly by `tenant_id`. No tenant can inspect or modify records belonging to another college.
2. **Deterministic & Quantized ML:**  
   To prevent expensive GPU requirements and variable cloud API fees, machine learning inference runs strictly on CPU using quantized INT8 ONNX models (`onnxruntime`).
3. **Dual Persistence Strategy:**  
   The application defaults to local `SQLite` (`campus_nexus.db`) for immediate zero-configuration evaluation, while supporting production `PostgreSQL 16` with `pgvector` via standard SQLAlchemy configuration.
4. **Cryptographic Anonymity:**  
   Whistleblower reporting decouples identity validation from report submission using RSA blind signatures ($m' = m \cdot r^e \pmod n$), guaranteeing zero institutional deanonymization.

---

## 13. Technology Stack (Exact Versions)

### Frontend
- **Framework:** Next.js `14.2.0` (App Router)
- **Language:** TypeScript `5.7.2`
- **UI & Styling:** Tailwind CSS `3.4.16`, PostCSS `8.4.49`, Autoprefixer `10.4.20`
- **Charting & Visualizations:** Recharts `2.13.3`
- **Icons:** Lucide React `0.468.0`
- **Runtime:** Node.js `18+` / React `18.3.1`

### Backend
- **Framework:** FastAPI `0.115.0+`
- **ASGI Server:** Uvicorn `0.30.0+`
- **ORM & Data Layer:** SQLAlchemy `2.0.35+`, Pydantic `2.9.0+`
- **Security:** PyJWT `2.9.0+`, Cryptography `43.0.0+`
- **Scientific Computing:** NumPy `2.1.0+`, SciPy `1.14.0+`, Scikit-learn `1.5.0+`
- **Document Generation:** ReportLab `4.2.0+` (PDF), Python-Docx `1.1.2+` (DOCX)
- **Image Processing:** Pillow `11.0.0+`

### Machine Learning & Inference
- **Inference Engine:** ONNX Runtime `1.20.0+` (CPUExecutionProvider)
- **Model Formats:** ONNX `1.17.0+` INT8 quantized models
- **Database Driver:** Psycopg `3.2+`, pgvector `0.3.6+`

### DevOps & Testing
- **Orchestration:** Docker Compose (PostgreSQL 16 + Redis 7 + API + Web)
- **Testing:** Pytest `8.3.0+`, HTTPX `0.27.0+`

---

## 14. Project Directory Structure

```text
prasunex-innovathon-2026/
├── compose.yaml                     # Multi-container Docker Compose configuration
├── README.md                        # Master documentation
├── backend/                         # FastAPI Python Backend
│   ├── Dockerfile                   # Python container definition
│   ├── requirements.txt             # Locked Python dependencies
│   ├── campus_nexus.db              # Seeded SQLite database (local demo)
│   ├── tests/
│   │   └── test_api.py              # End-to-end automated pytest suite (9 tests)
│   └── app/
│       ├── __init__.py
│       ├── main.py                  # FastAPI factory, CORS & route registrations
│       ├── config.py                # Environment settings & tier feature matrices
│       ├── database.py              # SQLAlchemy engine & session factory
│       ├── models.py                # 15 relational ORM models with tenant_id
│       ├── security.py              # PBKDF2 hashing, JWT & tier-gating dependencies
│       ├── seed.py                  # Synthetic data generator (2 colleges, 208 users)
│       └── modules/
│           ├── auth_tenancy.py      # Authentication, registration & ARR billing
│           ├── grading.py           # Relative grading sandbox & IRT item audit
│           ├── study.py             # DKT diagnostics, study planner & micro-drills
│           ├── attendance.py        # Attendance 75% predictor & early-warning radar
│           ├── facilities.py        # Multimodal grievance desk & MobileNet triage
│           ├── accreditation.py     # NBA/NAAC attainment matrix & SAR export
│           ├── privacy.py           # RSA blind signature & dual-key encrypted reporting
│           └── network.py           # Hungarian peer matcher & recruiter marketplace
├── ml/                              # Machine Learning Scaffolding
│   ├── export_models.py             # Script generating INT8 ONNX models
│   ├── inference.py                 # Runtime inference (BKT, DKT-GRU, MobileNet, SBERT)
│   └── artifacts/                   # Local model artifact directory
└── frontend/                        # Next.js 14 App Router Frontend
    ├── Dockerfile                   # Node.js production container definition
    ├── package.json                 # Locked npm dependencies
    ├── tsconfig.json                # TypeScript compiler configuration
    ├── tailwind.config.ts           # Tailwind theme & design token mappings
    ├── app/
    │   ├── layout.tsx               # Root application layout
    │   ├── page.tsx                 # Full multi-portal UI, workflows & visualizations
    │   └── globals.css              # Design system styling & multi-colour system
    └── components/                  # Shared UI primitives
```

---

## 15. Installation & Quick Start

### Method 1: Local Development (Recommended for Fast Evaluation)

#### Terminal 1: Backend API
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*On first startup, the database is automatically created and seeded with 2 colleges and 208 demo users.*

#### Terminal 2: Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Method 2: Docker Compose (One-Command Startup)

```bash
docker compose up --build
```
This builds and runs:
- **Web App:** `http://localhost:3000`
- **FastAPI API:** `http://localhost:8000`
- **PostgreSQL 16 (pgvector):** `localhost:5432`
- **Redis 7:** `localhost:6379`

<<<<<<< HEAD
| Role          | Email                    | Password       |
| ------------- | ------------------------ | -------------- |
| Administrator | `admin@nitx.demo`      | `admin`      |
| Professor     | `professor@nitx.demo`  | `professor`  |
| Student       | `student001@nitx.demo` | `student123` |
| Technician    | `technician@nitx.demo` | `technician` |
| Recruiter     | `recruiter@nitx.demo`  | `recruiter`  |
=======
---
>>>>>>> f2ee259a (Deploy: Update CAMPUS-NEXUS v2 with multi-colour design, test suite, and comprehensive README)

## 16. Prerequisites

- **Python:** `3.11` or higher
- **Node.js:** `18.0.0` or higher
- **npm:** `9.0.0` or higher
- **Docker & Docker Compose:** *(Optional, only required for Method 2)*

---

## 17. Environment Variables

The application runs with zero configuration by defaulting to local SQLite. For custom deployments, configure environment variables:

```ini
# Database (Defaults to SQLite for local demo; use PostgreSQL for production)
DATABASE_URL=sqlite:///./campus_nexus.db
# DATABASE_URL=postgresql+psycopg://campus:campus_dev@localhost:5432/campus_nexus

# Redis Cache (Optional)
REDIS_URL=redis://localhost:6379/0

# Security (Change in production)
JWT_SECRET=campus-nexus-dev-secret-key-change-in-prod-2026
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# File Storage & Model Artifacts
UPLOAD_DIR=./uploads
ML_DIR=../ml/artifacts

# Frontend Internal API URL (Used by Next.js rewrites in Docker)
API_INTERNAL_URL=http://localhost:8000
```

---

## 18. API Documentation & Data Contracts

All endpoints are documented interactively in OpenAPI / Swagger format at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

| Method | Endpoint | Access Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates credentials and returns JWT token + user features |
| `POST` | `/api/auth/register` | Public | Registers a new user within an existing college code |
| `GET` | `/api/colleges/public` | Public | Returns available college tenants for login selection |
| `GET` | `/api/dashboard/overview`| Authenticated | Aggregates college metrics, attendance average & open tickets |
| `GET` | `/api/grading/courses` | Professor, Admin | Returns courses assigned to the current college |
| `POST` | `/api/grading/sandbox` | Professor, Admin | Simulates Gaussian + KDE curves and IRT item discrimination |
| `GET` | `/api/grading/export-csv/{id}` | Professor, Admin | Streams CSV export of finalized curved marks |
| `GET` | `/api/knowledge/me` | Student | Returns concept mastery states and prerequisite mappings |
| `POST` | `/api/knowledge/attempts` | Student | Records a practice answer and updates BKT posterior |
| `GET` | `/api/study-plan` | Student | Fetches current scheduled study sessions |
| `POST` | `/api/study-plan/generate` | Student | Generates targeted revision sessions based on weak concepts |
| `GET` | `/api/micro-drills` | Student | Returns 3 targeted questions on weakest prerequisite topics |
| `GET` | `/api/attendance/me` | Student | Returns per-course attendance with safe skip & catch-up counts |
| `GET` | `/api/attendance/early-warning` | Professor, Admin | Cohort radar flagging students at debarment risk ($< 75\%$) |
| `GET` | `/api/facilities/tickets` | Authenticated | Lists maintenance tickets with SLA status and photos |
| `POST` | `/api/facilities/tickets` | Student, Staff | Ingests ticket + photo, runs MobileNet triage and dedup check |
| `POST` | `/api/privacy/blind-sign`| Student (Enterprise) | Issues RSA blind signature on unblinded token |
| `POST` | `/api/privacy/reports` | Public (Token-backed) | Submits anonymous report with dual-key encryption |
| `GET` | `/api/accreditation/outcomes` | Professor, Admin | Returns Course Outcome - Program Outcome attainment matrices |
| `GET` | `/api/accreditation/sar.pdf` | Professor, Admin | Generates 1-click NBA/NAAC Self-Assessment Report in PDF |
| `GET` | `/api/recruiter/talent` | Recruiter | Searches opted-in students filtered by concept mastery & CGPA |

---

## 19. Database Schema & State Management

```mermaid
erDiagram
    COLLEGE ||--o{ USER : contains
    COLLEGE ||--o{ COURSE : offers
    USER ||--o{ ATTENDANCE_RECORD : tracks
    USER ||--o{ KNOWLEDGE_STATE : maintains
    USER ||--o{ STUDY_PLAN_ITEM : schedules
    COURSE ||--o{ CONCEPT_NODE : defines
    COURSE ||--o{ ASSESSMENT_QUESTION : contains
    COURSE ||--o{ MARK_RECORD : stores
    USER ||--o{ MAINTENANCE_TICKET : reports
    COLLEGE ||--o{ ZK_REPORT : holds

    COLLEGE {
        string id PK
        string code UK
        string tier
        int student_count
        string rsa_n
        string rsa_e
    }
    USER {
        string id PK
        string tenant_id FK
        string email UK
        string role
        string department
        float cgpa
        int karma_points
    }
    COURSE {
        string id PK
        string tenant_id FK
        string code
        string title
        int credits
    }
    KNOWLEDGE_STATE {
        string id PK
        string student_id FK
        string concept_code
        float bkt_mastery
        float dkt_mastery
    }
    MAINTENANCE_TICKET {
        string id PK
        string reporter_id FK
        string vision_category
        float vision_confidence
        string status
        datetime sla_deadline
    }
    ZK_REPORT {
        string id PK
        string tracking_code UK
        string category
        text encrypted_body
        string status
    }
```

---

## 20. Authentication & Authorization

- **JWT Authentication:** Stateful user session tokens signed with `HS256`, containing `user_id`, `tenant_id`, and `role`.
- **Role-Based Access Control (RBAC):**  
  Enforced via FastAPI dependency injection:
  - `require_roles(["chancellor_dean", "professor_hod"])`
  - `require_roles(["student"])`
  - `require_roles(["technician_warden"])`
  - `require_roles(["recruiter"])`
- **Subscription Tier Feature Flags:**  
  Enforced via `require_feature("zk_grievance")` and `require_feature("vision_triage")`. Institutions on the `Core` or `Cognitive` tiers cannot access enterprise-only endpoints unless upgraded.

---

## 21. Security & Privacy Architecture

1. **Password Protection:** PBKDF2 with SHA-256 (600,000 iterations) and cryptographically random per-user salt.
2. **Multi-Tenancy Isolation:** Application-enforced row-level security ensuring all queries include `WHERE tenant_id = :authenticated_tenant_id`.
3. **Cryptographic Whistleblower Anonymity:**  
   RSA blind-signature verification guarantees that while the college server verifies student eligibility, the report body is decoupled from network IP, student name, and registration credentials.
4. **Data Minimization in Talent Marketplace:**  
   Students must explicitly toggle `opt_in_recruiter = true` before their profile is visible. Contact details remain hidden until formal interview offers are accepted.

---

## 22. Error Handling & Resilience

- **Structured API Exceptions:** Clean JSON error payloads with human-readable diagnostic messages:
  ```json
  { "detail": "Attendance record not found for course CS301 in your institution." }
  ```
- **Database Fallback:** Automatic SQLite fallback when PostgreSQL or Redis are unavailable, ensuring zero disruption during local demonstrations.
- **Client Toast Notification System:** Non-blocking error and success notifications in the Next.js frontend with auto-dismiss timers.

---

## 23. Testing & Quality Assurance

The backend includes an automated test suite verifying all critical workflows:

```bash
cd backend
PYTHONPATH=. .venv/bin/pytest tests/test_api.py -v
```

### Verified Test Results

```text
tests/test_api.py::test_health PASSED                     [ 11%]
tests/test_api.py::test_public_colleges PASSED            [ 22%]
tests/test_api.py::test_role_logins PASSED                [ 33%]
tests/test_api.py::test_dashboard_overview PASSED         [ 44%]
tests/test_api.py::test_student_study_and_drills PASSED   [ 55%]
tests/test_api.py::test_professor_grading_sandbox PASSED  [ 66%]
tests/test_api.py::test_accreditation_outcomes PASSED     [ 77%]
tests/test_api.py::test_facilities_tickets PASSED         [ 88%]
tests/test_api.py::test_privacy_blind_key PASSED          [100%]

========================= 9 passed in 1.12s =========================
```

---

## 24. Performance Optimization & Edge Efficiency

- **Quantized INT8 ONNX:** GRU-DKT and MobileNet triage models are quantized to INT8, consuming less than 15 MB of RAM and completing inference in $< 12$ milliseconds on standard commodity CPUs.
- **Client Bundle Size:** Next.js App Router tree-shaking ensures optimized initial bundle sizes with lightweight SVG icon rendering via `lucide-react`.
- **Offline Embedding Hashes:** 384-dimensional dense semantic vectors are generated using Blake2b hashing with synonym normalization, avoiding multi-gigabyte PyTorch transformer downloads.

---

## 25. Deployment Guide

### Deploying the Frontend (Vercel)
1. Import repository `vanshikayadav6153-ai/prasunex-innovathon-2026` into [Vercel](https://vercel.com/new).
2. Set **Root Directory** to `frontend`.
3. Set environment variable `API_INTERNAL_URL` to your production FastAPI backend URL.
4. Click **Deploy**.

### Deploying the Full Stack (Railway / Render)
1. Connect the GitHub repository in [Railway](https://railway.app/).
2. Railway detects `compose.yaml` and provisions the Next.js frontend, FastAPI backend, PostgreSQL database, and Redis cache automatically.

### Instant Public Tunnel (Zero Setup)
Expose your local development instance instantly to judges or mobile devices:
```bash
npx localtunnel --port 3000
```

---

## 26. Future Roadmap

- [ ] **Automated Biometric Anti-Proxy:** HMAC-based rotating QR tokens paired with campus WiFi BSSID geofencing.
- [ ] **Automated OCR Examination Paper Grading:** Extended OCR pipeline for handwritten answer script recognition.
- [ ] **Multi-College Federated Knowledge Tracing:** Privacy-preserving cross-institutional DKT parameter sharing across Indian technical universities.
- [ ] **DigiLocker Integration:** Direct issuance of verifiable academic credentials and transcripts via National Academic Depository (NAD).

---

## 27. Known Limitations & Honest Disclosures

- **Simulated Demonstration Data:** In accordance with competition rules, the local database is seeded with synthetic institutional records (2 colleges, 208 students) to protect student privacy.
- **Production Cryptographic Audit:** While RSA blind signatures and dual-key envelope encryption are fully functional in code, enterprise institutional deployment requires formal third-party cryptographic review and HSM-backed key custody.
- **Zero External Paid LLMs:** All core prediction algorithms use local deterministic logic or CPU-only INT8 ONNX models; no commercial paid LLM APIs are invoked in core workflows.

---

## 28. Contribution Guidelines

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/campus-enhancement`).
3. Ensure all tests pass (`pytest tests/test_api.py`).
4. Commit your changes (`git commit -m 'feat: Add Bloom taxonomy level 6 support'`).
5. Push to the branch (`git push origin feature/campus-enhancement`).
6. Open a Pull Request.

---

## 29. Development Workflow

- **Branch Protection:** `main` branch is kept deployable.
- **Linting:** Pre-commit code formatting via `ruff` / `black` for Python and `eslint` for TypeScript.
- **Commit Convention:** Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).

---

## 30. License & Ownership

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.  
Built for the **Prasunex Innovathon 2026**.

---

## 31. Author & Project Links

- **Team Members:** Vanshika Yadav & Himadri Mondal
- **Repository:** [https://github.com/vanshikayadav6153-ai/prasunex-innovathon-2026](https://github.com/vanshikayadav6153-ai/prasunex-innovathon-2026)
- **Live Showcase Deployment:** [https://campus-nexus0.netlify.app/](https://campus-nexus0.netlify.app/)
- **Documentation Maintainer:** Senior Full-Stack Engineering Team & Product Architecture Lead

---

## 32. Acknowledgments & References

- **Prasunex Innovathon 2026:** Competition organizers, review panel, and academic mentors.
- **National Board of Accreditation (NBA):** Self-Assessment Report (SAR) guidelines and CO-PO mapping criteria.
- **NAAC:** Institutional assessment and accreditation benchmarking standards.
- **Open-Source Communities:** FastAPI, Next.js, ONNX Runtime, and SQLAlchemy.

---

<div align="center">
  <sub>CAMPUS-NEXUS v2 · From a mark to a decision. · Designed for institutional excellence.</sub>
</div>
