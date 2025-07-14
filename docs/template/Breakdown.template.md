Below is a **super‑detailed `breakdown.template.md`** you can drop into `/docs/template/`.
It keeps a familiar structure but adds the extra scaffolding your AI agent (and humans) need for rock‑solid planning, estimation, and tracking.

````md
# 📂 Task Breakdown Template

> **How to use:**  
> 1. Replace `<…>` placeholders.  
> 2. Keep headings in place so downstream tooling can parse them.  
> 3. Check‑boxes (`[ ]`, `[x]`) drive progress metrics in dashboards.

---

## 0 ️⃣ Quick Summary / Goal
<One‑sentence description of the feature or problem>

---

## 1 ️⃣ Epic Overview

| Epic ID | Epic Name | Description | KPI / Success Metric | Owner | Status |
|---------|-----------|-------------|----------------------|-------|--------|
| EP‑01 | User Authentication | Secure access for all user types | 99% successful logins < 300 ms | <name> | 🔄 Draft |
| EP‑02 | Order Processing | End‑to‑end order lifecycle | <metric> | <name> | ⏳ Planned |
| … | | | | | |

---

## 2 ️⃣ Detailed Epics

> Repeat this **sub‑section** for every epic in the table above.

### Epic: `<EPIC NAME>`

#### 2.1 Feature List
| Feature ID | Title | Short Description | Priority (MoSCoW) | Status |
|------------|-------|-------------------|-------------------|--------|
| FE‑01 | Login | Email / password auth | Must | Draft |
| FE‑02 | Signup | New account creation | Must | Draft |
| FE‑03 | Forgot Pwd | Reset via email OTP | Should | Draft |

#### 2.2 User Stories
```gherkin
# FE‑01
As an unauthenticated user,
I want to log in with my email and password,
so that I can access my personal dashboard.

# FE‑02
As a visitor,
I want to create a new account in under 2 minutes,
so that I can start placing orders immediately.
````

#### 2.3 Technical Task Backlog

| Task ID | Description                | Component / Layer | Estimate (h) | Depends On | Assignee | Status | Acceptance Criteria              |
| ------- | -------------------------- | ----------------- | ------------ | ---------- | -------- | ------ | -------------------------------- |
| T‑01    | Design Auth DB schema      | DB                | 4            | —          | <name>   | ⏳      | ERD reviewed & approved          |
| T‑02    | Implement JWT issuance     | API               | 6            | T‑01       | <name>   | ⏳      | Token passes RFC 7519 validation |
| T‑03    | Write unit tests for login | API               | 3            | T‑02       | <name>   | ⏳      | ≥ 90 % branch coverage           |
| T‑04    | Add CI job for auth module | DevOps            | 2            | T‑02       | <name>   | ⏳      | Pipeline green in < 5 min        |

##### Non‑Functional / Cross‑Cutting Tasks

| ID     | Area          | Requirement          | Task                    | Owner  | Status |
| ------ | ------------- | -------------------- | ----------------------- | ------ | ------ |
| NFT‑01 | Performance   | p95 login < 300 ms   | Load‑test with 1 k RPS  | <name> | ⏳      |
| NFT‑02 | Security      | OWASP A2 prevention  | Implement rate‑limiter  | <name> | ⏳      |
| NFT‑03 | Observability | Trace each auth call | Add OpenTelemetry spans | <name> | ⏳      |

#### 2.4 Risk & Mitigation

| Risk                        | Impact | Likelihood | Mitigation                        |
| --------------------------- | ------ | ---------- | --------------------------------- |
| Upstream OAuth lib unstable | High   | Medium     | Pin to LTS release; add e2e tests |

#### 2.5 Test Matrix

| Scenario           | Type (Unit/IT/E2E) | Tool / Framework | Owner      | Status |
| ------------------ | ------------------ | ---------------- | ---------- | ------ |
| Happy‑path login   | E2E                | Cypress          | QA <name>  | ⏳      |
| Brute‑force attack | Security           | OWASP ZAP        | Dev <name> | ⏳      |

---

## 3 ️⃣ Timeline & Milestones

| Milestone                  | Start      | End (ETA)  | Exit Criteria              | Owner    | Status |
| -------------------------- | ---------- | ---------- | -------------------------- | -------- | ------ |
| M1 — Requirement Freeze    | YYYY‑MM‑DD | YYYY‑MM‑DD | PRD signed                 | PM       | ✅      |
| M2 — Architecture Approved | …          | …          | C4 diagrams reviewed       | Lead Eng | 🔄     |
| M3 — MVP Code Complete     | …          | …          | All Must‑have tasks merged | Team     | ⏳      |
| M4 — Beta Launch           | …          | …          | 0 P1 bugs, KPI met         | DevOps   | ⏳      |

---

## 4 ️⃣ Dependency Matrix

| This Task | Depends On         | Type (Code/API/People) | Risk if Late |
| --------- | ------------------ | ---------------------- | ------------ |
| T‑02 JWT  | External SSO certs | API                    | Auth blocked |

---

## 5 ️⃣ Resource & Effort Summary

| Role          | Name   | Allocation (%) | Notes             |
| ------------- | ------ | -------------- | ----------------- |
| Front‑end Dev | <name> | 50             | React SPA work    |
| Back‑end Dev  | <name> | 100            | Auth microservice |
| QA            | <name> | 30             | Test planning     |

Total dev effort: **<xx> person‑days**

---

## 6 ️⃣ Environment & Tooling

* **Dev Env:** Docker + Compose (`docker‑compose up auth`)
* **CI/CD:** GitHub Actions; pipeline file: `.github/workflows/auth.yml`
* **Secrets:** Managed by Vault path `kv/prod/auth/*`

---

## 7 ️⃣ Monitoring & Alerting

| Metric           | Threshold     | Dashboard     | Alert Channel |
| ---------------- | ------------- | ------------- | ------------- |
| Login error rate | > 1 % / 5 min | Grafana: Auth | #oncall‑auth  |

---

## 8 ️⃣ Rollback / Recovery Plan

1. Toggle feature flag `auth_v2` off in LaunchDarkly.
2. Re‑deploy previous container image (`auth:1.3.5`).
3. Restore last known‑good DB snapshot (<timestamp>).

---

## 9 ️⃣ Open Questions / Assumptions

* Do we need social‑login in MVP?
* Assume single‑region deployment initially?
* …

---

## 🔚 Done Criteria

* All **Must** stories deployed to production behind guarded feature flag.
* Unit ≥ 90 % & E2E ≥ 80 % coverage; pipelines green.
* Performance & security NFRs met in staging load‑test.
* Documentation (API spec, run‑book) published & linked here.
* Stakeholders sign off; no critical open questions.

---
