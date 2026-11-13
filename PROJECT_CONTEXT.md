# CAMPUS-NEXUS v2: Project Context & Source of Truth

**Project Name:** CAMPUS-NEXUS v2  
**Tagline:** Cognitive Operating System for Colleges  
**Deployment Target:** Real runnable project (Hackathon demo, runs locally on a laptop, all CPU)

---

## 1. System Stack
* **Frontend:** Next.js 14 (App Router, TypeScript, Tailwind CSS, shadcn/ui, Recharts)
* **Backend:** FastAPI (Python 3.11 async) + python-socketio
* **Database & Migrations:** PostgreSQL 16 + pgvector (HNSW indexing, 384-dimensional embeddings) + Alembic
* **Cache & Queues:** Redis 7 + Celery
* **Object Storage:** MinIO (S3-compatible, local object storage)
* **ML / Math Engines:** PyTorch, scikit-learn, scipy, sentence-transformers (`all-MiniLM-L6-v2`) | All CPU optimized

---

## 2. Core Roles (RBAC)
1. **student** - Learner with access to personalized knowledge graphs, peer study, grievance submissions, and academic tracking.
2. **professor** - Course instructor managing marks, OBE metrics, syllabus coverage, and diagnostic exams.
3. **hod** (Head of Department) - Departmental oversight on curriculum health, faculty marks distribution, and escalations.
4. **dean** - Institutional oversight across academic performance, campus-wide SLA metrics, and accreditation readiness.
5. **technician** - Facilities and maintenance operations, handling work orders, physical asset tickets, and equipment repair.
6. **admin** - System configuration, identity, role provisioning, and audit governance.

---

## 3. Portals & Workspaces

### A. Student Command Center
* **Academic Engine:** Degree audit, course timeline, credits progress, and continuous assessment breakdown.
* **Opportunity Radar:** Matched hackathons, research fellowships, and academic opportunities curated via student profile signals.
* **Grievance Desk:** Multi-category issue submission with real-time SLA tracking, automated duplicate detection, and escalation ladder.
* **Mastery Radar:** Dynamic visual representation of student concept mastery based on continuous assessment and diagnostic drills.

### B. Professor Diagnostic Studio
* **Marks & OBE (Outcome-Based Education):** Real-time mapping of student marks to Course Outcomes (COs) and Program Outcomes (POs).
* **Grading Studio:** Interactive grading curves (Gaussian, KDE, linear offset) with real-time grade shift simulation and fairness metrics.
* **Diagnostic Engine:** Item Response Theory (IRT) assessment audits, syllabus coverage analyzers, and exam clash detection.

---

## 4. Five Key Innovations

1. **DKT-Graph (Deep Knowledge Tracing + Prerequisite Directed Graph):**
   * Combines sequential learner interactions with an explicit Bayesian & Graph-based prerequisite topology.
   * Pinpoints upstream prerequisite concept gaps when a student struggles with downstream assessment questions.

2. **Grading Sandbox + IRT (Item Response Theory) Audit:**
   * Interactive grading simulation sandbox allowing professors to test curve adjustments before locking grades.
   * 2-parameter logistic (2PL) IRT auditing to detect question discrimination ($a$), difficulty ($b$), and anomalous items needing human review.

3. **Vision + SBERT Grievance Desk with SLA Forecast:**
   * Multimodal grievance intake extracting image context and complaint semantics.
   * `all-MiniLM-L6-v2` dense embeddings with cosine similarity / HNSW index for duplicate deduplication and automated priority routing.
   * Regression-based SLA deadline and equipment maintenance forecasting.

4. **Peer Matcher (Hungarian Algorithm / Bipartite Matching):**
   * Optimal complementary study pairing based on concept mastery matrices (matching strong students in Concept A who need help in Concept B with complementary peers).
   * Solved optimally using the Kuhn-Munkres (Hungarian) minimum cost maximum bipartite matching algorithm.

5. **Zero-Knowledge / Blind-Signed Anonymous Reporting:**
   * Cryptographically blinded token issuance enabling verified enrolled students to submit sensitive complaints or whistleblowing reports without revealing identity or linkability.
   * Verification guarantees genuine student eligibility while mathematically decoupling identity from report payloads.

---

## 5. Development & Verification Rules

* **No fake or hardcoded data in features:** All metrics, predictions, matching algorithms, and search results must compute over real SQLite/PostgreSQL tables and runnable ML pipelines.
* **Honest Labelling:** If any model or process is approximated or simulated for demo purposes, it must be explicitly labelled in the UI footer and `README.md`.
* **Execution Verification:** Never mark a feature "done" without executing and verifying it in runtime.
* **Progress Tracking:** Maintain `FEATURE_CHECKLIST.md` at root tracking `status: working / partial / not done` with concrete verification proofs (commands, tests, or endpoints verified).
* **UI Theme:** Dark plum background with pink, amber, cyan, and green accents.

---

## 6. Workspace Folder Structure
* `/frontend`: Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui components, Recharts dashboards.
* `/backend`: FastAPI async application, routers, database models, Alembic migrations, Celery worker definitions.
* `/ml`: Standalone ML models, PyTorch DKT networks, IRT estimators, Hungarian matcher, embedding extractors.
* `/infra`: Docker compose definitions, MinIO setup, PostgreSQL with pgvector init scripts, Redis configuration.
* `/docs`: Architecture specifications, mathematical formulations, user guide, and demo walkthrough script.
