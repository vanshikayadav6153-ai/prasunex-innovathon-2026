# CAMPUS-NEXUS v2: 5-Minute Hackathon Demo Script

Follow this step-by-step walkthrough to demonstrate all 5 core innovations and platform features to the judges.

---

### Step 0: Quick Launch & Verification (30 Seconds)
1. Launch all services:
   ```bash
   make test   # Confirms 21/21 innovation tests pass in ~11s
   make up     # Or PYTHONPATH=backend python -m uvicorn app.main:app --port 8000
   ```
2. Open Browser at `http://localhost:3000` (or demo console).

---

### Step 1: Innovation 1 — DKT-Graph & Root-Cause Micro-Drill (1 Minute)
- **Role:** Login as Student (`student001@nitx.demo` / `student123`).
- **Action:**
  1. Navigate to **Mastery Radar / DKT Graph** for `CS301 (Operating Systems)`.
  2. Point out that `OS-DEADLOCK (Deadlock Detection)` is failing at **28% (Red)**.
  3. Show the **Root-Cause Diagnosis Card**: CAMPUS-NEXUS automatically walked up the prerequisite DAG and identified that Deadlock is failing because its upstream prerequisite `OS-SYNC (Semaphores & Mutex)` is weak (**41%**).
  4. Click **"Take 3-Question Micro-Drill"** on Semaphores. Answer the questions.
  5. Watch mastery jump to **>80% (Green)** with CPU ONNX inference latency logged in <2ms!

---

### Step 2: Innovation 2 — Grading Studio & 2PL IRT Question Audit (1 Minute)
- **Role:** Login as Professor (`professor@nitx.demo` / `professor`).
- **Action:**
  1. Open **Grading Studio** for `CS301`.
  2. Demonstrate the **Interactive Z-Score Sliders**: drag the sigma cutoffs; notice instant recalculation of normal share vs actual share without lag.
  3. Show the **Silverman KDE Overlay vs Gaussian Fit** chart.
  4. Scroll to **2PL IRT Question Audit Table**:
     - Question `Q5` is flagged with point-biserial correlation $r_{pbis} < 0.15$ ("Missed by top students, guessed by weak ones").
  5. Click **"Drop Question"** -> totals and letter grades recompute instantly.
  6. Click **"Undo"** -> restores marks from the append-only `GradeChangeLedger`.

---

### Step 3: Innovation 3 — Vision + SBERT Grievance Desk with SLA (1 Minute)
- **Role:** Login as Student or Technician (`technician@nitx.demo` / `technician`).
- **Action:**
  1. Open **Facilities Desk** and submit a defect at `Lab 2 - Bench 14` with an oscilloscope photo.
  2. Show **MobileNetV3 CPU AI classification** (`oscilloscope`, confidence 89%) and **SBERT 384-d Cosine Deduplication** ($\ge 0.82$).
  3. Show the dynamic priority formula $W = \text{Base} \cdot \log_2(1+N) \cdot (1 + 0.1\Delta t)$ in action.
  4. Click **"Verify Cryptographic Ledger"**: walks the SHA-256 genesis hash chain and verifies 100% integrity. Show that altering any past row triggers tamper detection!

---

### Step 4: Innovation 4 — Hungarian Complementary Peer Matcher (45 Seconds)
- **Role:** In Student Command Center.
- **Action:**
  1. Navigate to **Peer Study Matcher**.
  2. Show how Student 001 (strong in OS Architecture, weak in Deadlock) is paired with Student 002 (strong in Deadlock, weak in Architecture).
  3. Explain the **Inverted Cost Minimization** ($C_{ij} = \max(B) - B_{ij}$) ensuring Hungarian algorithm pairs maximally complementary students.
  4. Show **Dual-Confirmation Karma**: both students click "Session Done" to release verified karma points, preventing self-farming.

---

### Step 5: Innovation 5 — Anonymous Whistleblower Shield (45 Seconds)
- **Role:** Sensitive Reporting Tab.
- **Action:**
  1. Student browser generates secret & nullifier, blinds message with RSA public key ($m' = m \cdot r^e \pmod N$).
  2. College blind-signs the credential verifying enrollment without learning the secret.
  3. Student unblinds signature and files sensitive report (e.g. Anti-Ragging) with decoupling receipt tracking code (`SHIELD-XXXXX`).
  4. Propose double filing: try filing again with same nullifier -> **409 Conflict** rejected!
  5. Check database: **Zero roll numbers or student IDs exist in the report table.**
