# Security and privacy risk register
| Surface | Observation | Required closeout | Owner |
|---|---|---|---|
| Authentication | Next demo identity is separate from FastAPI. Navigation checks role cookies. | Centralize session validation, require institutional role provisioning, verify backend scope for every write. | Identity |
| Tenant storage | SQLite lacks Postgres RLS and startup can fall back silently. | Verify effective database, tenant-denial tests, migrations and production fail-closed policy. | Platform |
| Sensitive reports | Legacy blind signatures differ from Semaphore. App, network and infrastructure metadata can correlate submissions. | Threat model, independent review, separate committee authorization, retention controls. Disable real intake pending review. | Privacy |
| Logs | Reverse proxy, Uvicorn and workers have independent log policies. | Inspect deployed logs, redact sensitive paths, headers, peer addresses and payloads at every layer. | Operations |
| Model recommendations | Fixtures, prototype weights and missing training sets limit inference. | Document provenance, uncertainty and reviewer sign-off before decisions. | Academic |
| Vault | AES-GCM storage interface requires a separately managed key and caller authorization. | KMS lifecycle, backup restore and retention tests before real data. | Platform |
| Claims | DPDP/UGC/attendance and business claims come from proposal. | Institutional legal review. Date and label claims and synthetic benchmarks. | Governance |
| Demo deployment | Published test credentials, reset workflow, CORS and development secrets are unsafe for real records. | Isolate deployment, restrict origins, externalize secrets and review recovery flows. | Identity |
