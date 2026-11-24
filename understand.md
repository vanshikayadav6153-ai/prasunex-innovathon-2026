# CAMPUS-NEXUS v2: Comprehensive Product & Technical Document

> **Event:** Prasunex Innovathon 2026 · Idea & Prototype Submission  
> **Project Name:** CAMPUS-NEXUS (v2)  
> **Tagline:** *One Campus. One Intelligence. Better Decisions.*  
> **Subtitle:** *Transforming academic performance, campus operations, and student wellbeing through connected AI.*  
> **Team Members:** Himadri Mondal, Nandini Singh, Vanshika Yadav, Anvesha Saraswat, Niranjana A R  
> **Core Theme:** *Smarter Campus. Brighter Future.*

---

## Table of Contents
1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [The 8 Campus Gaps & Solution Mapping](#2-the-8-campus-gaps--solution-mapping)
3. [The 15 Connected AI & Optimization Modules](#3-the-15-connected-ai--optimization-modules)
4. [AI Equations & Mathematical Foundations](#4-ai-equations--mathematical-foundations)
5. [End-to-End System Architecture](#5-end-to-end-system-architecture)
6. [Data Model & REST API Specification](#6-data-model--rest-api-specification)
7. [Market Opportunity & Regulatory Drivers (India)](#7-market-opportunity--regulatory-drivers-india)
8. [Business Model, Unit Economics & Financial Projections](#8-business-model-unit-economics--financial-projections)
9. [12-Month Gated Roadmap & Go-To-Market (GTM)](#9-12-month-gated-roadmap--go-to-market-gtm)
10. [Prototype Benchmarks & Proven Impact](#10-prototype-benchmarks--proven-impact)
11. [User Interface & Experience (UI/UX) Breakdown](#11-user-interface--experience-uiux-breakdown)

---

## 1. Executive Summary & Core Philosophy

Colleges and universities generate massive volumes of administrative and academic data—attendance records, quiz results, lab logs, maintenance tickets, and grievance reports. However, legacy systems record these data points in silos without ever connecting them.

**CAMPUS-NEXUS** introduces a connected intelligence layer across three dedicated consoles:
- **Student Portal:** Personalized mastery radar, scenario simulation, AI revision drills, and zero-knowledge anonymous safety desks.
- **Professor Studio:** Curve calibration sandbox, item difficulty and discrimination audits (IRT), and exam clash scheduling.
- **Admin & Operations Console:** Deduplicated ticket triage, predictive equipment failure alerts, and multi-tenant billing.

### The Three Operational Pillars:
1. **Explain:** Deep Knowledge Tracing (DKT-Graph) walks prerequisite DAGs backward to discover root conceptual weaknesses rather than simply labeling a student with a failing grade.
2. **Fix:** Computer Vision + SBERT semantic deduplication, automatic SLA escalation, and OR-Tools constraint satisfaction (CP-SAT) exam scheduling eliminate campus administrative bottlenecks.
3. **Protect:** Semaphore-based Zero-Knowledge (ZK) anonymous credentials allow students to report ragging, harassment, and bias without fear of IP logging, retaliation, or identity leaks.

```
       ┌─────────────────────────────────────────────────────────────┐
       │                 THE CLOSED-LOOP DATA ENGINE                 │
       └─────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
  [ ACADEMICS ]                 [ CAMPUS OPS ]                 [ TRUST ]
  • Marks In (CSV/Photo)        • Photo + Text Ticket         • Group Membership Proof
         │                            │                            │
         ▼                            ▼                            ▼
  • DKT Mastery Graph           • SBERT Semantic Dedup        • Semaphore ZK Nullifier
         │                            │                            │
         ▼                            ▼                            ▼
  • Gap-Aware Curve + IRT       • SLA Escalation Engine       • Auto-Escalation (3+ Hits)
         │                            │                            │
         ▼                            ▼                            ▼
  • Study Plan + Micro-Drills   • Weibull Failure Forecast    • Discreet Committee Review
```

---

## 2. The 8 Campus Gaps & Solution Mapping

Legacy Enterprise Resource Planning (ERP) systems and Learning Management Systems (LMS) suffer from eight systemic failure points:

| # | Legacy Campus Gap | What Breaks in Colleges Today | CAMPUS-NEXUS v2 Fix | Module # |
|---|---|---|---|---|
| **1** | **Cognitive Opacity** | A score of 14/30 only shows a numerical failure; it hides the missing foundational prerequisite concept from semester 1. | **DKT-Graph Root Cause Analysis**: Walks prerequisite dependency graphs backward to find prerequisite blockers. | `#1` |
| **2** | **Excel Fatigue** | Professors hand-tune grading curves arbitrarily without verifying if difficult exam questions were statistically flawed. | **Grading Sandbox + IRT Item Audit**: 2-Parameter Item Response Theory audits questions before grade curves are locked. | `#5, #6` |
| **3** | **Ticket Black-Holes** | 50 students report the same broken lab AC or water cooler; tickets lack SLAs and disappear into queues without accountability. | **Computer Vision + SBERT Semantic Dedup + SLA Escalator**: Merges duplicate tickets and auto-escalates at 24h/48h/72h. | `#3` |
| **4** | **Whistleblower Fear** | Students fear reporting ragging, harassment, or faculty bias because web portals log student IDs, cookies, or campus IP addresses. | **Semaphore Zero-Knowledge Credentials**: Cryptographic proofs demonstrate valid college membership with complete unlinkability. | `#2` |
| **5** | **Scattered Notices** | Hackathons, scholarship deadlines, and fest schedules are buried in chaotic WhatsApp and Telegram groups. | **Notice-to-Event NLP Parser**: Extracts dates, eligibility, and links into calendar JSON feeds matched to student skills. | `#14` |
| **6** | **Test Clustering** | Department timetables overlap, subjecting students to 3 or 4 high-stakes exams within 48 hours. | **CP-SAT Constraint Exam Scheduler**: Minimizes cognitive clustering and student exam stress across overlapping electives. | `#9` |
| **7** | **Marks-Entry Friction** | Entering individual question-level scores into ERPs takes hours, so professors only record aggregated totals. | **Photo-to-Marks OCR Ingestion**: Computer vision extracts tabular marks from physical paper sheets with checksum validation. | `#8` |
| **8** | **Reactive Repairs** | Critical lab equipment and hostel water purifiers are serviced only after catastrophic breakdowns during exams. | **Weibull Reliability Forecasting**: Survival models predict 14-day failure probabilities for preemptive maintenance. | `#13` |

---

## 3. The 15 Connected AI & Optimization Modules

CAMPUS-NEXUS links 15 purpose-built modules into a single shared data loop:

```
                      15 CONNECTED MODULES BY FUNCTION
   ┌───────────────────────────────────┬───────────────────────────────────┐
   │ 1. Learning Intelligence (26.7%)  │ 2. Assessment Fairness (26.7%)    │
   ├───────────────────────────────────┼───────────────────────────────────┤
   │ #1  DKT-Graph (Knowledge Tracing) │ #5  Grading Sandbox (KDE/Z-score) │
   │ #7  Grade Time Machine (What-If)  │ #6  Gap-Aware Grading (GMM/DP)    │
   │ #11 Syllabus RAG Copilot          │ #8  Photo-to-Marks OCR Ingest     │
   │ #15 Forgetting-Aware Micro-Drills │ #10 Paper Auditor (Bloom/Coverage)│
   ├───────────────────────────────────┼───────────────────────────────────┤
   │ 3. Campus Operations (26.7%)      │ 4. Community & Extracurriculars   │
   ├───────────────────────────────────┼───────────────────────────────────┤
   │ #3  Vision + SBERT Dedup Desk     │ #4  Peer Matcher (Hungarian Algo) │
   │ #9  CP-SAT Exam Scheduler         │ #14 Notice-to-Event Parser (13.3%)│
   │ #12 Anti-Proxy Attendance QR      ├───────────────────────────────────┤
   │ #13 Weibull Equipment Forecast    │ 5. Trust, Privacy & Safety (6.7%) │
   │                                   │ #2  Anonymous ZK Credentials      │
   └───────────────────────────────────┴───────────────────────────────────┘
```

### Module Descriptions:
1. **#1 DKT-Graph (Deep Knowledge Tracing):** Couples Recurrent Neural Networks (LSTM) with Bayesian Knowledge Tracing (BKT) overlaid on directed acyclic course graphs (DAGs) to identify prerequisite learning gaps.
2. **#2 Anonymous Credentials:** Implements Semaphore Zero-Knowledge Proofs on Ethereum-compatible cryptographic curves, allowing verifiable grievance reporting with double-sign prevention via nullifiers.
3. **#3 Vision + SBERT Dedup Desk:** Utilizes YOLOv8-nano to recognize damaged physical campus assets paired with `all-MiniLM-L6-v2` 384-dimensional text embeddings in `pgvector` to deduplicate maintenance work orders (cosine threshold $\ge 0.82$).
4. **#4 Peer Study Matcher:** Runs the Kuhn-Munkres Hungarian Algorithm to pair students with complementary knowledge profiles (strong in topics where the peer is weak) and allocates hackathon teams.
5. **#5 Relative Grading Sandbox:** Provides real-time Gaussian calibration, Kernel Density Estimation (KDE), and Item Discrimination analysis for professors before submitting official grades.
6. **#6 Gap-Aware Boundary Grading:** Identifies natural score clusters using Gaussian Mixture Models (GMM) and Dynamic Programming to prevent students from being stranded fractions of a mark below grade cutoffs.
7. **#7 Grade Time Machine (What-If Forecaster):** Gradient Boosting Machine (GBM) with TreeSHAP explainability that models how targeted study hours will impact final semester GPA.
8. **#8 Photo-to-Marks OCR:** Perspective-correcting computer vision (OpenCV) that reads physical grade sheets, digitizes cell values, and cross-checks arithmetic totals before faculty commit.
9. **#9 Low-Clustering Exam Scheduler:** Google OR-Tools Constraint Programming (CP-SAT) engine that distributes examinations across cohort schedules to eliminate test pile-ups.
10. **#10 Question Paper Auditor:** Evaluates draft question papers against Bloom’s Taxonomy levels, course syllabus coverage, and past-year paper overlap.
11. **#11 Syllabus RAG Copilot:** Retrieval-Augmented Generation using local vector search on vetted institutional courseware with strict citation grounding (declines out-of-scope halluncinations).
12. **#12 Anti-Proxy Attendance Radar:** Combines dynamic 15-second rotating HMAC-SHA256 QR codes with device fingerprinting and Isolation Forest anomaly detection to eradicate proxy attendance.
13. **#13 Weibull Equipment Failure Forecaster:** Statistical parametric survival analysis that calculates 14-day breakdown probabilities across lab equipment and hostel utilities.
14. **#14 Notice-to-Event NLP Parser:** Vision OCR + LLM pipeline that converts event posters and scattered text announcements into structured JSON schema with calendar integration.
15. **#15 Forgetting-Aware Micro-Drills:** Adaptive spaced repetition engine built on the Free Spaced Repetition Scheduler (FSRS) algorithm to prevent memory decay before midterms.

---

## 4. AI Equations & Mathematical Foundations

CAMPUS-NEXUS v2 is powered by 16 core mathematical equations across probability, machine learning, optimization, and reliability theory:

### 4.1. Bayesian Knowledge Tracing (BKT) & DKT-Graph
Updates mastery probability $P(L_t)$ given an observed student attempt $a_t \in \{0, 1\}$:

$$P(L_t \mid a_t = 1) = \frac{P(L_t)(1 - S)}{P(L_t)(1 - S) + (1 - P(L_t)) G}$$

$$P(L_{t+1}) = P(L_t \mid a_t) + (1 - P(L_t \mid a_t)) \cdot T$$

Where:
- $P(L_0) = 0.30$ (Initial prior mastery)
- $T = 0.15$ (Probability of transition/learning)
- $G = 0.20$ (Probability of guess)
- $S = 0.10$ (Probability of slip/careless mistake)

### 4.2. Item Response Theory (IRT) 2-Parameter Logistic (2PL) Model
Evaluates exam question quality and student latent ability $\theta$:

$$P_i(\theta) = \frac{1}{1 + e^{-a_i(\theta - b_i)}}$$

Item Discrimination Point-Biserial Correlation ($r_{\text{pbis}}$):

$$r_{\text{pbis}} = \frac{\bar{X}_1 - \bar{X}_0}{S_X} \sqrt{p(1 - p)}$$

- Questions with $r_{\text{pbis}} < 0.15$ are flagged.
- Questions with negative correlation ($r_{\text{pbis}} < 0$, e.g., $Q_{13} = -0.24$) reveal ambiguous phrasing that penalizes high-ability students, prompting automated grace marks or question nullification.

### 4.3. Gap-Aware Grading Cutoff Optimization
Replaces rigid Z-scores ($Z = \frac{X - \mu}{\sigma}$) by minimizing the count of students trapped within $\varepsilon = 1.0$ mark below grade boundaries:

$$\min_{c_1, \dots, c_k} \sum_{j=1}^k \# \{ X_i \in [c_j - \varepsilon, c_j) \} \quad \text{subject to } c_j - c_{j-1} \ge \Delta_{\min}$$

Solved via Dynamic Programming in $\mathcal{O}(k N^2)$ time. For small cohorts ($N < 40$), Kernel Density Estimation (KDE) smoothes the distribution:

$$f(x) = \frac{1}{N h} \sum_{i=1}^N K\left(\frac{x - X_i}{h}\right)$$

### 4.4. Memory Retention & Spaced Repetition (FSRS-Style)
Models memory decay to schedule targeted micro-drills:

$$R(t, S) = \left( 1 + \frac{t}{9 S} \right)^{-1}$$

A drill notification is triggered precisely when retrievability drops to $R = 0.90$ (which occurs at elapsed time $t = S$). Successful recall elevates stability: $S_{new} = S_{prev} \cdot (1 + \alpha)$.

### 4.5. Grade Time Machine Study Budget Allocation
Allocates a constrained study budget of $H$ hours across weak topics to maximize final weighted predicted scores:

$$\max_{\{x_k\}} \sum_{k} w_k \cdot (m'_k(x_k) - m_k) \quad \text{subject to} \quad \sum_k x_k \le H, \quad x_k \ge 0$$

Given diminishing marginal returns $m'_k(x_k) = 1 - (1 - m_k) e^{-x_k / \tau}$, greedy marginal gain allocation is optimal. Topic weight $w_k$ is derived from TreeSHAP feature importance on semester outcomes.

### 4.6. Weibull Failure Distribution for Lab Assets
Calculates cumulative probability of hardware failure within a 14-day forward window:

$$h(t) = \frac{k}{\lambda} \left( \frac{t}{\lambda} \right)^{k-1}, \qquad P(\text{fail in } 14\text{d}) = 1 - \frac{S(t + 14)}{S(t)} = 1 - e^{-\left[\left(\frac{t+14}{\lambda}\right)^k - \left(\frac{t}{\lambda}\right)^k\right]}$$

### 4.7. Deduplication Priority Escalation Formula
Computes dynamic ticket urgency based on distinct reporting students ($N$) and unresolved duration ($\Delta t$ hours):

$$W = \text{Base} \times \log_2(1 + N) \times (1 + 0.1 \cdot \Delta t)$$

- Lab SLA: 48 Hours
- Hostel SLA: 24 Hours
- Escalates to Head of Department (HoD) at breach; auto-escalates to Dean at 72 hours.

---

## 5. End-to-End System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. PRESENTATION TIER                                                        │
│    Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui            │
│    Recharts · D3.js Charts · PWA Offline-First Queue                        │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / WSS
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 2. API & APPLICATION SERVICES TIER                                          │
│    FastAPI 3.11 · Uvicorn · Socket.IO WebSocket Server                      │
│    JWT Authentication + RBAC · ZK Proof Verifier Service                    │
│    Assessment Calibration Engine · OR-Tools CP-SAT Worker                   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ Internal Pipelines
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 3. AI / ML ANALYTICS CORE                                                   │
│    PyTorch (DKT/BKT) · scikit-learn (IRT, GMM, Isolation Forest)             │
│    Sentence-Transformers (all-MiniLM-L6-v2) · LightGBM + TreeSHAP           │
│    lifelines (Weibull Survival) · OpenCV + Tesseract OCR                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ SQL / Cache / Storage
┌──────────────────────────────────────▼──────────────────────────────────────┐
│ 4. PERSISTENCE & DATA INTEGRITY TIER                                        │
│    PostgreSQL 16 with pgvector Extension (384-d Cosine Index)               │
│    Redis (Session Tokens, Rate Limiting, Live SLA Clocks)                   │
│    Local Object Storage / Encrypted File Vault (AES-256)                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Model & REST API Specification

### 6.1. Schema Changes & Additions (v2)
1. `users`: Stripped of `zk_enrollment_hash` to guarantee complete unlinkability with submitted grievances.
2. `zk_group_members`: Stores `group_id` and Semaphore `identity_commitment`; strictly contains **no `user_id`**.
3. `grievance_tickets`: Fields `is_sensitive`, `nullifier` (unique per scope), `target_tag`, `status`, `escalation_level`.
4. `questions`: Contains `concept_id`, `bloom_level`, `max_marks`, `co_id` (Course Outcome mapping).
5. `review_cards`: FSRS spaced repetition table with `concept_id`, `stability`, `last_review`, `next_due`.
6. `exam_schedule`: Timetable slots with room IDs, invigilator IDs, and rollback version counters.
7. `attendance_scans`: Stores rotating QR `device_hash`, timestamp, geofence status, and Isolation Forest `anomaly_score`.
8. `equipment`: Asset registry with `installed_at`, maintenance logs, and fitted Weibull shape parameters ($k, \lambda$).
9. `events`: Campus event registry parsed via OCR, containing vector embeddings and faculty approval flags.

### 6.2. REST API Endpoints (`/api/v1`) & Real-Time WebSockets

```
POST   /api/v1/auth/zk-proof            Verify Semaphore ZK proof + nullifier
POST   /api/v1/marks/ingest-csv         Bulk upload student marks with sanity verification
POST   /api/v1/marks/ingest-photo       Computer vision OCR extraction from physical grade sheets
POST   /api/v1/grading/simulate         Run Absolute, Relative (Z-score), or Gap-Aware simulation
GET    /api/v1/analytics/dkt/{id}       Retrieve student DKT mastery vector & risk flags
POST   /api/v1/student/what-if          Simulate GPA outcome given modified topic effort
POST   /api/v1/student/study-plan       Optimal greedy allocation of study hours
POST   /api/v1/paper/audit              Audit exam question paper against Bloom's taxonomy & IRT
POST   /api/v1/schedule/solve           Trigger OR-Tools CP-SAT exam clash optimization
POST   /api/v1/copilot/ask              Cited, hallucination-free RAG query on syllabus
POST   /api/v1/attendance/scan          Validate 15-second rotating HMAC QR code
GET    /api/v1/admin/equipment/forecast 14-day Weibull failure risk ranking
POST   /api/v1/grievance/submit         File work order or anonymous ZK grievance
WS     /ws/v1/sla-tracker/{id}          Live WebSocket stream of ticket resolution countdown
```

---

## 7. Market Opportunity & Regulatory Drivers (India)

### 7.1. Macro Scale (AISHE 2021-22 Data)
- **4.33 Crore (43.3 Million)** students enrolled in Indian Higher Education.
- **28.4%** Gross Enrolment Ratio (GER), growing from 23.7% in 2014-15.
- **NEP 2035 Target:** 50.0% GER ($\sim 1.8\times$ expansion of learners across existing college infrastructure).
- **58,643 Total Institutions:** 1,168 Universities, 45,473 Affiliated Colleges, 12,002 Standalone Institutes.
- **16 Lakh (1.6 Million)** Faculty Members.
- **98.5 Lakh (9.85 Million)** STEM Students represent the initial high-intent beachhead market.

### 7.2. Addressable Market Sizing (At ₹400/student/year blended)
- **TAM (Total Addressable Market):** **₹1,732 Crore / year** ($4.33\text{ Cr students} \times ₹400$).
- **SAM (Serviceable Addressable Market - STEM):** **₹394 Crore / year** ($98.5\text{ Lakh STEM students} \times ₹400$).
- **SOM (Serviceable Obtainable Market - Year 3):** **₹14.4 Crore / year** ($120\text{ campuses} \times 3,000\text{ students}$).

### 7.3. Why Institutions Must Act Now (Regulatory & Operational Tailwinds)
1. **Digital Personal Data Protection (DPDP) Act 2023:** Mandates purpose limitation, explicit consent logs, and heavy penalties for student data breaches.
2. **UGC Anti-Ragging Guidelines:** Mandates accessible, tamper-evident grievance mechanisms where victims can report abuse without fear of exposure.
3. **NBA / NAAC Accreditation:** Demands auditable evidence of Course Outcome (CO) and Program Outcome (PO) attainment across individual exam questions.
4. **Mandatory 75% Attendance Rule:** Enforces strict physical presence verification that legacy paper signatures and static proxy QR codes cannot guarantee.
5. **Surging Enrolment Ratios:** Student-to-faculty ratios are expanding; manual intervention and manual curve grading are collapsing under load.

---

## 8. Business Model, Unit Economics & Financial Projections

### 8.1. Pricing Structure
- **Pilot Plan (Free for 1 Semester):** Single department deployment covering Modules #1 (DKT), #5 (Grading Sandbox), #6 (Gap-Aware Grading), and #8 (OCR Ingest).
- **Core Plan (₹250 / student / year):** Full learning intelligence, assessment engines, Student Portal, and Professor Studio.
- **Plus Plan (₹450 / student / year):** All 15 modules, including vision ticket dedup, Weibull asset forecasts, and ZK anonymous credentials.
- **University Plan (Custom Enterprise):** Single Sign-On (SSO), private cloud/VPC deployment, dedicated data sovereignty region, custom SLAs.
- **Blended ARPU Assumption:** **₹400 / student / year** (assuming 60% Core / 40% Plus adoption).

### 8.2. Unit Economics (Per-Student Basis)
- **Revenue per Student:** ₹400.00
- **Cost to Serve (COGS):** **₹95.00**
  - Cloud Compute & GPU Inference: ₹30.00 (31.6%)
  - Support & Customer Success Staff: ₹35.00 (36.8%)
  - Data Compliance & Security Auditing: ₹15.00 (15.8%)
  - Payment Gateways & Administrative Overhead: ₹15.00 (15.8%)
- **Gross Profit per Student:** **₹305.00**
- **Gross Margin:** **76.2%**

```
                   ANNUAL COST-TO-SERVE BREAKDOWN (₹95)
                    ┌──────────────────────────────────┐
                    │  Support Staff:     ₹35.00 (37%) │
                    │  Cloud / GPU:       ₹30.00 (32%) │
                    │  Data & Compliance: ₹15.00 (16%) │
                    │  Payments & Misc:   ₹15.00 (16%) │
                    └──────────────────────────────────┘
```

### 8.3. Single Campus Economics (Average 3,000 Students)
- **Annual Recurring Revenue (ARR):** $3,000 \times ₹400 =$ **₹12.00 Lakh**
- **Annual Cost to Serve:** $3,000 \times ₹95 =$ **₹2.85 Lakh**
- **Annual Gross Profit:** **₹9.15 Lakh**
- **Customer Acquisition Cost (CAC - One Time):** **₹3.30 Lakh**
  - Sales Demos & Travel: ₹1.80 Lakh
  - Technical Onboarding & SIS Data Ingestion: ₹1.50 Lakh
- **CAC Payback Period:** $\frac{₹3.30\text{L}}{₹9.15\text{L}} \times 12\text{ months} =$ **4.3 Months**

### 8.4. Three-Year Revenue Projections (Scenarios)

| Growth Scenario | Year 1 Campuses (ARR) | Year 2 Campuses (ARR) | Year 3 Campuses (ARR) |
|---|---|---|---|
| **Cautious** | 5 campuses (₹0.60 Cr) | 20 campuses (₹2.40 Cr) | 50 campuses (₹6.00 Cr) |
| **Base Case** | **10 campuses (₹1.20 Cr)** | **45 campuses (₹5.40 Cr)** | **120 campuses (₹14.40 Cr)** |
| **Ambitious** | 20 campuses (₹2.40 Cr) | 90 campuses (₹10.80 Cr) | 250 campuses (₹30.00 Cr) |

---

## 9. 12-Month Gated Roadmap & Go-To-Market (GTM)

The startup roadmap follows an iterative **Build $\to$ Measure $\to$ Learn** discipline with strict go/no-go gates:

```
  Month:  M1   M2   M3   M4   M5   M6   M7   M8   M9   M10  M11  M12
          [ Phase 1 ] ──► [    Phase 2    ] ──► [   Phase 3   ] ──► [   Phase 4   ]
          VALIDATE        PILOT                 PROVE               SCALE
          (Gate 1)        (Gate 2)              (Gate 3)            (Gate 4)
```

### 9.1. The 4 Gate Checks:
- **Gate 1 (Month 2 - Validate):** At least 70% of 40+ interviewed students and department heads rank marks opacity or unaddressed complaints among their top 3 institutional pain points.
- **Gate 2 (Month 6 - Pilot):** 2 active pilot campuses achieve $\ge 60\%$ weekly active student adoption and $\ge 80\%$ faculty usage of grading tools.
- **Gate 3 (Month 9 - Prove):** $\ge 60\%$ of pilot departments convert to paid contracts; repeat facility complaints drop by $\ge 25\%$.
- **Gate 4 (Month 12 - Scale):** Full campus payback achieved in under 6 months with zero unresolved DPDP audit findings across 12 paying institutions.

### 9.2. Top 5 Risks & Engineering Mitigations:
1. **Slow Institutional Procurement Cycles:** Mitigated by offering an immediate 1-semester zero-friction pilot requiring only departmental HoD approval rather than board signoff.
2. **Messy Legacy Paper & Excel Data:** Ingests unformatted marks through OpenCV OCR and flexible CSV/XLSX column auto-mappers.
3. **Student Distrust of Campus Grievance Systems:** Eliminated by device-generated Semaphore ZK-SNARK proofs where identity commitments never touch the database.
4. **DPDP Non-Compliance & Data Leaks:** Enforces field-level AES-256 encryption, row-level security (RLS), and zero IP logging for sensitive interactions.
5. **Algorithmic Bias or Unfair Automated Grading:** Human-in-the-loop requirement where every AI curve recommendation requires professor review and digital sign-off.

---

## 10. Prototype Benchmarks & Proven Impact

Tested across seeded synthetic cohorts (100 students across 14 questions, and 60 students across multi-course exam schedules), CAMPUS-NEXUS demonstrated immediate statistical improvements:

```
                  PROTOTYPE BENCHMARK IMPROVEMENTS
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. Boundary-Stranded Students:    80% Reduction (15 → 3)    │
  │ 2. Students with Clashing Exams:  39% Reduction (186 → 114) │
  │ 3. Overall Exam Stress Score:     23% Reduction (1187 → 936)│
  └─────────────────────────────────────────────────────────────┘
```

### Capability Comparison Across Systems:
- **Legacy ERP (Score: 3 / 16):** Basic attendance and numerical grade logging. Complete absence of prerequisite diagnostics, predictive models, or privacy protections.
- **Standard LMS (Score: 5 / 16):** Digital assignment submissions and rudimentary rubrics. Lacks intelligent grading curves, item discrimination audits, or campus operations integration.
- **CAMPUS-NEXUS v2 (Score: 16 / 16):** Complete coverage across all 8 dimensions—weakness diagnosis, fair grading, marks entry, grievance resolution, whistleblower privacy, balanced scheduling, peer matching, and adaptive study planning.

---

## 11. User Interface & Experience (UI/UX) Breakdown

The system delivers a modern, high-contrast interface designed for intuitive, role-based workflows:

### 11.1. Landing Showcase Experience
- **Hero Display:** Live interactive mockups displaying real-time academic health metrics ($78.5\%$ performance, $86\%$ attendance, $72\%$ mastery).
- **Interactive Persona Portals:** One-click role switching between Student, Faculty, and Admin personas seeded with real-time test datasets.
- **Feature Exploration Matrix:** Explorable cards detailing all 6 foundational cognitive engines.

### 11.2. Student Studio Dashboard
- **Top Navigation Bar:** Sticky, responsive layout housing all 10 core student modules (Overview, My Academics, Mastery Map, Grade Predictor, AI Study Planner, Micro Drills, AI Copilot, Grievance Centre, Campus Life, Settings) with adaptive desktop dropdown and mobile menus.
- **Mastery Donut Widget:** Visualizes real-time topic mastery (e.g., $72\%$ overall mastery, DBMS $92\%$, OS $78\%$, Networks $64\%$, Data Structures $41\%$) with DKT dependency graph drill-downs.
- **Grade Time Machine:** Interactive effort slider allowing students to simulate grade improvements (e.g., $+10\%$ study effort raises projected score from $78\%$ to $83\%$, converting a $B+$ to an $A-$).
- **AI Study Recommendation Card:** Automated action checklist with mascot guidance and calendar-synced study schedules.
- **NEXUS AI Copilot Drawer:** Real-time chat assistant providing targeted revision drills, course concepts, and weak-topic explanations.
- **Upcoming Assessment Radar:** Urgency-coded cards tracking upcoming quizzes, lab practicals, and project submission deadlines.
