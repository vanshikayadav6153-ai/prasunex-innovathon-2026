# PRASUNEX INNOVATHON 2026 — ROUND 3 SUBMISSION DOSSIER
## Functional Prototype Development & Demonstration

> **Event:** Prasunex Innovathon 2026 · Round 3: Prototype Development & Demonstration  
> **Development & Submission Period:** 18 November – 25 November 2026  
> **Shortlisting Results Date:** 27 November 2026  
> **Project Name:** **CAMPUS-NEXUS (v2)**  
> **Tagline:** *One Campus. One Intelligence. Better Decisions.*  
> **Core Theme:** *Smarter Campus. Brighter Future.*  
> **Team Members:** Himadri Mondal, Nandini Singh, Vanshika Yadav, Anvesha Saraswat, Niranjana A R  

---

### Key Submission Links
- 🌐 **Live Working Prototype (Vercel Production):** [https://prasunex-innovathon-2026-omega.vercel.app](https://prasunex-innovathon-2026-omega.vercel.app)
- 🐙 **Source Code Repository (GitHub):** [https://github.com/vanshikayadav6153-ai/prasunex-innovathon-2026.git](https://github.com/vanshikayadav6153-ai/prasunex-innovathon-2026.git)
- 🧪 **Automated Test Suite Status:** **21/21 Innovation Tests Passing (100% Pass Rate)**

---

## Table of Contents
1. [Executive Summary & Core Objectives](#1-executive-summary--core-objectives)
2. [Demonstration of Core Functionality (Working MVP)](#2-demonstration-of-core-functionality-working-mvp)
3. [Live Demonstration & Video Walkthrough Guide](#3-live-demonstration--video-walkthrough-guide)
4. [Source Code, Repository Structure & Execution](#4-source-code-repository-structure--execution)
5. [Brief Technical Documentation & Mathematical Foundations](#5-brief-technical-documentation--mathematical-foundations)
6. [Explanation of Implemented Features & Technical Limitations](#6-explanation-of-implemented-features--technical-limitations)
7. [Future Development Plans & Scalability Roadmap](#7-future-development-plans--scalability-roadmap)
8. [Direct Alignment with Round 3 Evaluation Criteria](#8-direct-alignment-with-round-3-evaluation-criteria)

---

## 1. Executive Summary & Core Objectives

Modern higher-education campuses generate millions of academic and operational data points—attendance records, quiz logs, lab maintenance grievances, exam grades, and student concerns. However, legacy enterprise software treats these signals in isolated operational silos.

**CAMPUS-NEXUS (v2)** is an integrated, cognitive campus operating system that solves institutional blindness through five mathematically rigorous, connected AI and optimization engines:
1. **Explain (DKT-Graph):** Rather than simply displaying a failing grade, Deep Knowledge Tracing walks student interaction sequences backwards through a prerequisite Directed Acyclic Graph (DAG) to isolate root-cause conceptual gaps.
2. **Standardize (2PL IRT Grading Studio):** Replaces arbitrary manual grading with Item Response Theory item difficulty audits and Silverman Kernel Density Estimation (KDE) curve calibration.
3. **Automate (Vision + SBERT Grievance Desk):** Automatically classifies equipment defects using CPU-quantized computer vision, semantically deduplicates duplicate complaints ($Cosine \ge 0.82$), escalates based on dynamic logarithmic priority, and records all actions on an append-only SHA-256 hash-chained ledger.
4. **Collaborate (Hungarian Complementary Matcher):** Pairs students with mutually complementary knowledge vectors using an inverted cost matrix to optimize peer-to-peer learning efficiency.
5. **Protect (Anonymous Whistleblower Shield):** Uses RSA Chaum Blind Signatures and spent nullifier tracking to provide verifiable, anti-retaliation reporting for anti-ragging and mental health without logging roll numbers or student identifiers.

---

## 2. Demonstration of Core Functionality (Working MVP)

CAMPUS-NEXUS is engineered as a full-stack, multi-tenant system with four distinct role-based portals:

### 2.1 Four Unified User Consoles
1. **Student Command Center (`/student/dashboard`):**
   - **Academic Mastery Radar:** Real-time DKT mastery visualization with interactive diagnostic micro-drills.
   - **75% Attendance Forecaster:** Exact calculation of safe skips, required recovery streaks, and timetable clash alerts.
   - **Peer Study Matcher:** Hungarian-paired study partners with dual-confirmation karma points.
   - **Anonymous Shield:** Zero-knowledge anti-ragging and grievance filing with cryptographic receipt generation (`SHIELD-XXXXX`).
   - **1-Click Gate Pass:** Dynamic QR-coded out-pass generation verified at campus gates.

2. **Professor & HOD Studio (`/faculty/dashboard`):**
   - **Relative Grading Sandbox:** Real-time Z-score cutoffs with instant bell-curve and empirical KDE re-computation.
   - **2PL IRT Item Difficulty Audit:** Identifies flawed questions (point-biserial $r_{pbis} < 0.15$) with 1-click drop/undo recalculation.
   - **Course At-Risk Radar:** Early-warning identification of students before semester examinations.

3. **Admin & Dean Operations Console (`/admin/dashboard`):**
   - **Institutional Performance Overview:** Real-time KPI metrics, department retention, and facility operational indices.
   - **National Board of Accreditation (NBA/NAAC) Pack:** One-click compliance report generator mapping marks and student outcomes.
   - **SLA & Facility Health:** Aggregated tickets, MTTR tracking, and live campus alerts.

4. **Technician & Facilities Desk (`/other/dashboard`):**
   - **Defect Triage Queue:** Real-time vision-classified repair tickets with photo attachments.
   - **Cryptographic Ledger Integrity:** One-click SHA-256 block chain verification to detect tampering in ticket histories.

### 2.2 Instant Demo Access
The platform includes one-click instant authentication pre-seeded with realistic institutional data:
- **Student Demo:** `student001@nitx.demo` / `student123`
- **Professor Demo:** `professor@nitx.demo` / `professor`
- **Admin Demo:** `admin@nitx.demo` / `admin`
- **Technician Demo:** `technician@nitx.demo` / `technician`

---

## 3. Live Demonstration & Video Walkthrough Guide

This structured 5-minute walkthrough guarantees full demonstration of all core capabilities during evaluation:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 5-MINUTE PROTOTYPE DEMONSTRATION TIMELINE                   │
└─────────────────────────────────────────────────────────────────────────────┘
  00:00 - 00:30 ── Platform Introduction & Role-Based Gateway
  00:30 - 01:30 ── Innovation 1: DKT-Graph & Root-Cause Micro-Drills
  01:30 - 02:30 ── Innovation 2: Relative Grading Studio & 2PL IRT Item Audit
  02:30 - 03:30 ── Innovation 3: Computer Vision & SBERT Triage Desk with Ledger
  03:30 - 04:15 ── Innovation 4: Hungarian Complementary Peer Matching
  04:15 - 05:00 ── Innovation 5: Anonymous Whistleblower Shield & Summary
```

### Detailed Minute-by-Minute Script:
1. **Minute 00:00 – 00:30 | Gateway & Unified Login:**
   - Open [https://prasunex-innovathon-2026-omega.vercel.app/login](https://prasunex-innovathon-2026-omega.vercel.app/login).
   - Highlight clean design tokens (Mint `#CDEBDD`, Emerald `#047857`, Gold `#FACC15`).
   - Click "Student Quick Demo" pill. Notice instant redirection to `/student/dashboard`.

2. **Minute 00:30 – 01:30 | Innovation 1: DKT-Graph Diagnostic Radar:**
   - In Student Dashboard, select **Mastery Radar / DKT Graph** tab.
   - Point to concept node `OS-DEADLOCK (Deadlock Detection)` failing at **28% (Red)**.
   - Explain the **Root-Cause Diagnosis Card**: CAMPUS-NEXUS traversed the DAG upstream and identified that Deadlock failure stems from prerequisite `OS-SYNC (Semaphores & Mutex)` at **41%**.
   - Click **"Take 3-Question Micro-Drill"**. Complete the diagnostic questions.
   - Watch mastery recompute to **>80% (Green)** via CPU-quantized INT8 ONNX neural inference in <2ms!

3. **Minute 01:30 – 02:30 | Innovation 2: Grading Studio & 2PL IRT Audit:**
   - Log in as Professor (`professor@nitx.demo`). Navigate to **Grading Studio**.
   - Drag sigma cutoffs on the interactive Z-score sliders; observe real-time distribution recalculation without browser latency.
   - Scroll down to the **2PL IRT Question Audit Table**. Question `Q5` is flagged with point-biserial correlation $r_{pbis} < 0.15$ (flawed question).
   - Click **"Drop Question"** $\to$ total scores and relative letter grades recompute instantly.
   - Click **"Undo"** $\to$ restores state from the append-only `GradeChangeLedger`.

4. **Minute 02:30 – 03:30 | Innovation 3: Vision + SBERT Grievance Desk:**
   - Navigate to Facilities Desk. Submit a defect at `Lab 2 - Bench 14` with an oscilloscope photo.
   - Observe **MobileNetV3 CPU AI classification** (`oscilloscope`, confidence 89%) and **SBERT 384-d Cosine Deduplication** against existing complaints.
   - Show dynamic priority weighting $W = \text{Base} \cdot \log_2(1+N) \cdot (1 + 0.1\Delta t)$.
   - Click **"Verify Cryptographic Ledger"**: walks the SHA-256 block chain from genesis to head and verifies 100% data integrity.

5. **Minute 03:30 – 04:15 | Innovation 4: Hungarian Peer Matcher:**
   - Switch to Student Portal $\to$ **Peer Study Matcher**.
   - Demonstrate how Student 001 (strong in OS Architecture, weak in Deadlock) is paired with Student 002 (strong in Deadlock, weak in Architecture).
   - Explain the **Inverted Cost Matrix** ($C_{ij} = \max(B) - B_{ij}$) guaranteeing optimal complementary pairing.
   - Demonstrate **Dual-Confirmation Karma**: both students verify session completion to earn karma points, preventing self-farming.

6. **Minute 04:15 – 05:00 | Innovation 5: Anonymous Whistleblower Shield:**
   - Open the **Sensitive Reporting Tab**.
   - Student browser generates secret & nullifier, blinds message with RSA public key ($m' = m \cdot r^e \pmod N$).
   - College signs token without seeing content; student unblinds signature and submits an anti-ragging report with tracking code `SHIELD-XXXXX`.
   - Attempt duplicate submission: system rejects with `409 Conflict`.
   - Inspect database: **0 roll numbers or student IDs exist in the report table.**

---

## 4. Source Code, Repository Structure & Execution

The complete production source code is publicly accessible on GitHub:
**Repository:** [https://github.com/vanshikayadav6153-ai/prasunex-innovathon-2026.git](https://github.com/vanshikayadav6153-ai/prasunex-innovathon-2026.git)

### 4.1 Architecture & Directory Layout
```
prasunex-innovathon-2026/
├── frontend/                     # Next.js 14 App Router Frontend
│   ├── app/                      # Page routes (/login, /student, /faculty, /admin, /other)
│   ├── components/               # UI components, Radix Primitives, Charts, Navbars
│   ├── context/                  # AuthContext, Role Guards, Session Management
│   └── lib/                      # Mock fallbacks, API client, formatting utilities
├── backend/                      # High-Performance FastAPI Backend
│   ├── app/
│   │   ├── main.py               # FastAPI entrypoint & Socket.IO server
│   │   ├── api_v1.py             # 25+ REST Endpoints for all 5 innovations
│   │   ├── database.py           # SQLAlchemy ORM engine & SessionLocal
│   │   └── models.py             # Relational data schema (Users, Ledger, Tickets)
│   └── tests/
│       └── test_all_innovations.py # Comprehensive 21-test innovation verification
├── ml/                           # CPU-Quantized Machine Learning Models
│   ├── artifacts/
│   │   ├── dkt_gru_int8.onnx     # Quantized Deep Knowledge Tracing recurrent model
│   │   └── vision_triage_int8.onnx # Quantized MobileNetV3 defect vision model
│   └── train_dkt.py              # PyTorch training & DAG extraction pipeline
└── infra/                        # Deployment manifests & Grafana dashboards
```

### 4.2 One-Command Local Startup
```bash
# 1. Clone repository
git clone https://github.com/vanshikayadav6153-ai/prasunex-innovathon-2026.git
cd prasunex-innovathon-2026

# 2. Run all innovation tests (21 tests in ~11 seconds)
PYTHONPATH=backend pytest backend/tests/test_all_innovations.py

# 3. Start full stack locally
./run.sh
# Frontend running at http://localhost:3000
# Backend running at http://localhost:8000
```

---

## 5. Brief Technical Documentation & Mathematical Foundations

### 5.1 Innovation Formulations
1. **Deep Knowledge Tracing Recurrent State Transition:**
   $$h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b)$$
   Where $x_t \in \mathbb{R}^{2K}$ encodes the one-hot representation of concept $k$ and correctness $y_t \in \{0, 1\}$. Latent mastery $P(y_{t+1}=1|k)$ is decoded from $h_t$ via sigmoid layer $\sigma(W_{hy} h_t)$.

2. **Two-Parameter Logistic Item Response Theory (2PL IRT):**
   $$P_i(\theta) = \frac{1}{1 + e^{-a_i (\theta - b_i)}}$$
   Where $\theta$ is student latent ability, $a_i$ is question discrimination power, and $b_i$ is difficulty threshold. Questions with point-biserial correlation $r_{pbis} < 0.15$ are flagged as anomalous.

3. **Dynamic Grievance SLA Escalation Formula:**
   $$W = \text{Base} \cdot \log_2(1 + N) \cdot (1 + 0.1 \cdot \Delta t_{\text{hours}})$$
   Where $N$ is count of deduplicated reports at the same campus node and $\Delta t$ is elapsed hours since initial filing.

4. **Complementary Peer Affinity Matrix Inversion:**
   $$B_{ij} = \sum_{k} |M_i^k - M_j^k| \cdot (1 - \min(M_i^k, M_j^k))$$
   $$C_{ij} = \max(B) - B_{ij}$$
   Minimizing cost matrix $C$ using the Hungarian Algorithm (`linear_sum_assignment`) strictly maximizes complementary learning benefit.

5. **RSA Chaum Blind Signature Primitive:**
   - Blinding: $m' = m \cdot r^e \pmod N$
   - Institution Signing: $s' = (m')^d \pmod N$
   - Student Unblinding: $s = s' \cdot r^{-1} \pmod N \implies s^e \equiv m \pmod N$

---

## 6. Explanation of Implemented Features & Technical Limitations

In accordance with academic rigor and engineering transparency, our implementation status is categorized below:

| Component | Implemented & Verified | Technical Limitation / Boundary Disclosure |
| :--- | :--- | :--- |
| **DKT-Graph Engine** | ✅ INT8 ONNX recurrent model on CPU, DAG root-cause traversal, 3-question diagnostic micro-drill. | Synthetic student trajectory initialization (2,000 synthetic interactions) used for cold-start calibration. |
| **Grading Studio & IRT** | ✅ Real-time Z-score recalculation, Silverman KDE, point-biserial $r_{pbis}$ question audit, append-only undo ledger. | Computations run client-side and via NumPy/SciPy in memory; massive datasets (>50,000 students) would require batch worker offloading. |
| **Grievance Vision + Dedup** | ✅ MobileNetV3 INT8 defect classifier, SBERT 384-d Cosine Similarity ($\ge 0.82$), SHA-256 genesis hash chain. | Vision classifier supports 5 target defect categories (`oscilloscope`, `furniture`, `water/leak`, `electrical`, `other`). |
| **Hungarian Peer Matcher** | ✅ Inverted cost matrix complementary matching, odd roster triad handling, dual-confirmation karma points. | Assumes synchronous peer availability within the same academic cohort. |
| **Anonymous Shield** | ✅ RSA Chaum Blind Signatures, client-side blinding/unblinding, double-filing nullifier prevention (`409 Conflict`). | Uses RSA Blind Signatures rather than full SNARK zero-knowledge proofs (e.g. Circom/Groth16) to avoid browser WASM compilation overhead. |
| **75% Attendance Forecaster** | ✅ Safe skips ($a$), required classes ($b$), edge cases (impossible shortage, zero classes left). | Timetable schedules are pre-configured per semester rather than dynamically synced to third-party biometrics. |
| **Production Deployment** | ✅ High-performance Next.js 14 frontend on Vercel with graceful mock fallbacks and local FastAPI parity. | Deployed Vercel version runs serverless mock-layer mode for universal zero-downtime demonstration. |

---

## 7. Future Development Plans & Scalability Roadmap

Following Round 3 evaluation, CAMPUS-NEXUS is scheduled for three operational deployment phases:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       12-MONTH POST-HACKATHON ROADMAP                       │
└─────────────────────────────────────────────────────────────────────────────┘
  Q1 2027 (Phase 1) ── Pilot deployment across 2 partner engineering colleges
  Q2 2027 (Phase 2) ── Hardware IoT LoRaWAN mesh integration for campus assets
  Q3 2027 (Phase 3) ── Native iOS/Android Flutter app & biometric SIS connectors
  Q4 2027 (Phase 4) ── Circom/Groth16 zk-SNARK prover service in production
```

1. **Phase 1: Institution Pilot (Months 1–3):**
   - Live pilot across 2 partner colleges (1,500 students) for CSE and ECE departments.
   - Integration with existing learning management systems (Moodle, Canvas) via LTI 1.3.

2. **Phase 2: Campus IoT & Smart Sensing (Months 4–6):**
   - LoRaWAN sensor nodes for water tank levels, classroom power usage, and laboratory equipment run-hours.
   - Real-time vibration and temperature sensors feeding automatic predictive maintenance tickets.

3. **Phase 3: Native Mobile Apps & Enterprise ERP (Months 7–9):**
   - Offline-first Flutter mobile application for students and field technicians.
   - Native bi-directional connectors for enterprise Student Information Systems (SAP SLcM, Ellucian Banner).

4. **Phase 4: Cryptographic zk-SNARK Prover Service (Months 10–12):**
   - Production Circom/SnarkJS Groth16 circuit integration for zero-knowledge credential verification without server-side key custody.
   - Decentralized IPFS storage for immutable accreditation audit trails.

---

## 8. Direct Alignment with Round 3 Evaluation Criteria

| Evaluation Criterion | Implementation Evidence in CAMPUS-NEXUS v2 |
| :--- | :--- |
| **1. Functionality & Implementation Quality** | Full end-to-end working software across 4 portals (Student, Faculty, Admin, Staff). 21/21 automated tests pass in under 12 seconds covering all edge cases. |
| **2. Technical Execution** | Modern stack (Next.js 14 App Router, FastAPI, PyTorch ONNX Runtime, SciPy, SQLite/PostgreSQL). Zero external paid API dependencies; fully local CPU-friendly execution. |
| **3. User Experience & Usability** | Custom Mint + Emerald + Gold theme (`#CDEBDD`, `#047857`, `#FACC15`), responsive navigation, real-time interactive charts, 1-click demo personas, and sub-100ms UI interactions. |
| **4. Innovation & Effectiveness** | 5 novel computational engines: DKT prerequisite DAG traversal, 2PL IRT item audit, SBERT deduplication with hash-chained ledger, inverted Hungarian peer optimization, and Chaum blind signatures. |
| **5. Practical Applicability & Scalability** | Directly addresses Indian higher education challenges: 75% mandatory attendance rules, NBA/NAAC accreditation compliance, equipment downtime, and anti-ragging mandates. |
| **6. Quality of the Demonstration** | Pre-seeded live production prototype on Vercel, clear 5-minute timed demonstration script, transparent limitation disclosures, and one-command local reproduction. |

---

*Document compiled and certified by Team CAMPUS-NEXUS for Prasunex Innovathon 2026 Round 3 Evaluation.*  
*Submission Date: November 2026*
