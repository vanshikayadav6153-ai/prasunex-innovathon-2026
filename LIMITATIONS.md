# CAMPUS-NEXUS v2: Engineering Limitations & Simulation Disclosures

In accordance with our strict transparency policy, all machine learning models, cryptographic mechanisms, and operational components are documented below with honest performance benchmarks and boundary conditions.

---

### 1. DKT-Graph (Deep Knowledge Tracing)
- **Model Topology:** PyTorch GRU / LSTM recurrent neural network trained on student interaction sequences ($h_t = \tanh(W_{hh} h_{t-1} + W_{xh} x_t + b)$) and exported to CPU INT8 ONNX (`ml/artifacts/dkt_gru_int8.onnx`, 7 KB).
- **Inference Mode:** ONNX Runtime executing on CPU with quantised linear layers.
- **Latency:** ~1.2 ms - 2.8 ms per student evaluation on Apple Silicon CPU.
- **Prerequisite Graph:** 7 Core Operating System concepts (`OS-ARCH`, `OS-PROC`, `OS-SCHED`, `OS-SYNC`, `OS-DEADLOCK`, `OS-MEM`, `OS-VMEM`). Root-cause walk traverses directed acyclic graph (DAG) upstream to isolate unmastered prerequisites.
- **Data Disclosure:** Cold-start synthetic student interaction trajectories (~2,000 students $\times$ 5 assessments) simulate latent mastery propagation through the prerequisite DAG.

---

### 2. Anonymous Whistleblower Shield
- **Cryptographic Primitive:** RSA Chaum Blind Signature scheme with client-side message blinding ($m' = m \cdot r^e \pmod N$) and unblinding ($s = s' \cdot r^{-1} \pmod N$).
- **Anonymous Credential Rule:** Proves active campus enrollment without disclosing roll number or identity to the verifier.
- **Double-Filing Guard:** Spent nullifier hashes stored in `zk_token_nonces`. Attempting to submit multiple reports using the same blinded token returns `409 Conflict`.
- **Disclosure:** While mathematically equivalent to an anonymous credential, this implementation uses RSA Blind Signatures rather than a full zero-knowledge SNARK proof circuit (e.g. Circom/Groth16). Real deployment would isolate the signer key in a Hardware Security Module (HSM).

---

### 3. Grievance Desk Defect Vision Triage & SBERT Dedup
- **Vision Model:** MobileNetV3 CPU INT8 (`ml/artifacts/vision_triage_int8.onnx`, 2.3 KB) with keyword-boosted defect classifier covering 5 categories (`oscilloscope`, `chair/furniture`, `water/leak`, `electrical`, `other`).
- **Semantic Deduplication:** 384-dimensional text embeddings with Cosine Similarity threshold $\ge 0.82$ against open tickets at the same campus node.
- **Priority Dynamic Formula:** $W = \text{Base} \cdot \log_2(1 + N) \cdot (1 + 0.1 \cdot \Delta t_{\text{hours}})$.
- **Hash-Chained Ledger:** Append-only SHA-256 block chain with genesis root (`0` $\times$ 64) linking actions to previous block hashes. Any database mutation breaks chain verification.

---

### 4. Hungarian Peer Matcher
- **Mathematical Inversion:** The raw affinity formula $B_{ij} = \sum_k |M_i^k - M_j^k| \cdot (1 - \min(M_i^k, M_j^k))$ defines complementary learning benefit. Because `scipy.optimize.linear_sum_assignment` minimizes cost, passing $B_{ij}$ directly would pair identical learners. We invert the matrix to $C_{ij} = \max(B) - B_{ij}$, guaranteeing that cost minimization strictly pairs maximally complementary students.
- **Roster Bounds:** Handles odd rosters by forming a 3-student triad. Dual-confirmation karma points prevent single-party farming.

---

### 5. Hardware & Laptop Benchmarks
- All tests and endpoints run fully locally on standard consumer CPU without requiring NVIDIA GPUs or cloud API keys.
