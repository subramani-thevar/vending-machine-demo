# Resiliency & Deployment Clarification Questions

Since you opted into Resiliency and Security extensions, I need a few more details about your infrastructure and operations approach.

---

## Question 1: RTO/RPO Goals and Disaster Recovery Strategy
What are your Recovery Time Objective (RTO) and Recovery Point Objective (RPO) goals? These determine the appropriate Disaster Recovery strategy and infrastructure redundancy level.

A) RPO/RTO: Hours — Backup & Restore strategy. Lowest cost ($). Data backed up, no services deployed. Redeploy from IaC and restore from backups on failure. Suitable for non-critical workloads.

B) RPO/RTO: 10s of minutes — Pilot Light strategy. Cost: $$. Data live, services idle. Infrastructure deployed but not running, scaled up on failover. Suitable for important workloads.

C) RPO/RTO: Minutes — Warm Standby strategy. Cost: $$$. Data live, services run at reduced capacity. Scaled up during failover. Suitable for business-critical applications.

D) RPO/RTO: Near real-time — Multi-site Active/Active strategy. Highest cost ($$$$). Data live, live services in multiple regions simultaneously. Suitable for mission-critical, zero-downtime requirements.

E) N/A — Single-region deployment is acceptable, no cross-region DR needed. Rely on multi-zone availability within one region.

F) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 2: Change Management Process
How should production changes for this workload be governed?

A) Use our existing organizational change management process (ServiceNow, Jira Change, internal CAB, etc.)

B) No formal process exists — AI-DLC should propose a lightweight change management process

C) N/A — this workload is exempt from formal change management (demo/internal tooling)

D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 3: CI/CD and Deployment Tooling
What CI/CD tooling and deployment process should this workload use?

A) Use our existing CI/CD pipeline (GitHub Actions, GitLab CI, Jenkins, CodePipeline, etc.)

B) No pipeline exists — AI-DLC should propose a CI/CD pipeline definition

C) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 4: Rollback Mechanism
How should a failed production deployment be rolled back?

A) Redeploy previous IaC/artifact version (version-pinned rollback)

B) Blue/green swap back to the previous environment

C) Canary auto-rollback on health/metric regression

D) Database-aware rollback required (schema/data migration reversal)

E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 5: Deployment Style
What deployment strategy is acceptable for this workload's risk profile?

A) Direct / in-place (lowest cost, highest blast radius)

B) Rolling (gradual instance replacement)

C) Blue/green (zero-downtime cutover, higher cost)

D) Canary (progressive traffic shift with automated rollback)

E) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 6: Regional Topology
Does this workload require multi-region deployment, or is single-region with multi-zone redundancy sufficient?

A) Single-region, multi-zone — tolerates zone failure, not full-region failure. Lower cost.

B) Multi-region active-passive — survives region failure with failover. Higher cost.

C) Multi-region active-active — survives region failure with no downtime. Highest cost.

D) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 7: Incident Response Process
How are production incidents handled for this workload?

A) Use our existing incident response process (PagerDuty, internal IR/on-call, etc.)

B) No formal process exists — AI-DLC should propose a lightweight incident response process

C) Other (please describe after [Answer]: tag below)

[Answer]: 

## Question 8: Resiliency Testing Approach
How will resiliency mechanisms (failover, recovery) be validated?

A) Use our existing DR testing / game day / chaos engineering practice

B) No practice exists — AI-DLC should propose a DR testing schedule and chaos experiment plan

C) Defer to the Operations phase — capture test scenarios now, execute during Operations

D) Other (please describe after [Answer]: tag below)

[Answer]: 

---

**Instructions**: Please fill in your letter choice after each `[Answer]:` tag and let me know when you're done.
