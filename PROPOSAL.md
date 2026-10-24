# MidnightPay: Confidential On-Chain Payroll & Fund-Splitting Protocol

## 1. Executive Summary

**Product Name:** MidnightPay  
**Category:** Decentralized Finance (DeFi) / Enterprise Infrastructure / Confidential Payroll  
**Target Network:** Midnight Network (Testnet / Preprod)  
**Repository:** [https://github.com/Dhanshree-atre/NewMoon_Level4](https://github.com/Dhanshree-atre/NewMoon_Level4)  

MidnightPay is a confidential payroll and fund-splitting protocol built natively on Midnight. It enables organizations, decentralized autonomous organizations (DAOs), and global contractor networks to disburse salaries, contractor invoices, and multi-party revenue splits on-chain without exposing individual payment amounts to the public, coworkers, or competitors.

By pairing programmable data protection with zero-knowledge cryptographic proofs, MidnightPay proves aggregate payroll solvency and contractual compliance while keeping individual compensation strictly confidential.

---

## 2. The Real-World Problem

Public blockchains are inherently transparent. Every transaction, recipient address, and transfer amount is permanently broadcast to public block explorers. 

While public transparency is valuable for sovereign asset transfer and open governance, it is a fatal design flaw for organizational operations:
1. **Salary Leakage & Internal Friction:** When compensation is visible to coworkers, companies face organizational discord, wage envy, and impaired team morale.
2. **Competitive Intelligence Leaks:** Competitors can inspect treasury transfers to determine exact contractor rates, talent compensation bands, hiring velocity, and departmental budget allocations.
3. **Regulatory & Compliance Incompatibility:** In virtually every major jurisdiction (e.g., GDPR in the EU, California privacy regulations, standard employment law worldwide), individual wage confidentiality is an explicit legal standard or corporate requirement.
4. **Cap-Table Disclosures:** Multi-party equity distributions and DAO revenue splits reveal confidential cap-table structures and contributor weightings.

Because of this dealbreaker, crypto-native companies, DAOs, and remote teams still default to traditional fiat banking rails (e.g., Deel, Rippling, Wise) for compensation, forfeiting the programmable guarantees, instant settlement, and global accessibility of blockchain technology.

---

## 3. The Solution: MidnightPay

MidnightPay solves this fundamental impasse by utilizing Midnight's dual-state architecture (public ledger state combined with private off-chain witnesses and ZK circuits).

### Key Architectural Pillars:
* **Committed Aggregate Budget:** The employer deposits and publicly commits to a total payroll budget for a given pay cycle (e.g., 100,000 NIGHT or wrapped stablecoins).
* **Private Allocation Schedules:** The schedule mapping employee/contractor identities to specific payment amounts and blinding factors is maintained privately in the employer's client storage. Only a cryptographic commitment (root hash) is published on-chain.
* **Zero-Knowledge Entitlement Proofs:** When a worker claims compensation, they submit a zero-knowledge proof showing that:
  1. Their claimed payment corresponds to an authorized leaf in the employer's committed payroll schedule.
  2. The claim generates a deterministic, unique nullifier derived from their secret key, preventing double-claims.
  3. Cumulative disbursements never exceed the committed total payroll budget.
* **Selective Disclosure for Employees:** Each worker receives a provable cryptographic payment receipt. They can selectively disclose their income to third parties (mortgage lenders, tax authorities, landlords) on a need-to-know basis without disclosing their employer's total balance sheet or coworkers' earnings.
* **Aggregate Compliance Verification:** Auditors or tax authorities can verify aggregate withholding proofs (e.g., "Total payroll spend was \$X" or "Total withholding tax rate was Y%") without ever inspecting individual pay stubs.

---

## 4. Scope for Level 4 – Level 6

1. **Smart Contract (Compact):**
   - Public ledger tracking: employer identity, current cycle ID, total committed budget, total disbursed sum, schedule commitment root, claimed nullifier map, compliance hash, and cycle lifecycle flag.
   - Private witnesses: local secret keys, claim details (recipient address, salary amount, blinding salt, cycle ID), and compliance data.
   - Core circuits: `init_payroll_cycle`, `claim_salary`, `audit_compliance`, and `close_payroll_cycle`.
2. **Zero-Knowledge Circuit Proofs:**
   - Proves claim validity without revealing the recipient's identity or salary amount.
   - Proves aggregate budget solvency (`totalDisbursed <= totalCommittedBudget`).
   - Nullifier uniqueness verification preventing double-spending and diversion of funds.
3. **Decentralized Application Frontend (React + TypeScript):**
   - **Employer / Admin Dashboard:** Initialize payroll cycles, define private employee splits, commit schedule hashes, monitor disbursement progress, and close cycles.
   - **Worker / Contractor Portal:** Connect Midnight Lace wallet, query claim status, execute confidential salary claims with zero-knowledge proofs, and generate selective disclosure proofs for third parties.
   - **Auditor / Compliance Inspector:** Verify cryptographic compliance proofs without access to raw individual salary records.
4. **End-to-End Automated Testing & CI/CD:**
   - Unit and integration tests covering contract deployment, anonymous claims, double-spend prevention, budget overflow rejections, and unauthorized access denials.
   - GitHub Actions automated pipeline executing compilation and test suites on push.

---

## 5. Target Users & Market Impact

* **Web3-Native Startups & DAOs:** Organizations that operate completely on-chain but need standard payroll confidentiality.
* **Decentralized Contractor Networks:** Global freelance cooperatives and dev collectives needing trustless milestone payments without disclosing proprietary billable rates.
* **Fintech Payroll Platforms:** Next-generation payroll aggregators (e.g., Deel or Rippling for Web3) seeking verifiable, auditable rails with institutional privacy.
